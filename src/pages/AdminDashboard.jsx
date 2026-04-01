import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Edit3, Settings, LogOut, CheckCircle, AlertTriangle, Loader2, Image as ImageIcon, Video, Calendar, Activity, Filter, BarChart3, Clock, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [cmsData, setCmsData] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // CMS State
  const [cmsLoading, setCmsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);

  // Filters for logs
  const [logFilterAction, setLogFilterAction] = useState('ALL');
  const [logFilterPage, setLogFilterPage] = useState('ALL');

  const tabs = [
    { id: 'summary', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'upload', name: 'Add Memories', icon: <Upload className="w-4 h-4" /> },
    { id: 'manage', name: 'Media Library', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'content', name: 'Edit Content', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'history', name: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (localStorage.getItem('admin_session') === 'active') {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'hunny2026';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_session', 'active');
      fetchAllData();
    } else {
      setLoginError("Invalid password. Access denied.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMediaData(),
      fetchCmsData(),
      fetchLogs()
    ]);
    setLoading(false);
  };

  const fetchMediaData = async () => {
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (data) setMediaList(data);
  };

  const fetchCmsData = async () => {
    setCmsLoading(true);
    const { data } = await supabase.from('content').select('*').order('key', { ascending: true });
    if (data) setCmsData(data);
    setCmsLoading(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
    if (data) setLogs(data);
  };

  // ====== LOGGING SYSTEM ======
  const writeLog = async ({ action, page, section, field, oldValue, newValue, details }) => {
    try {
      await supabase.from('activity_logs').insert([{
        action, page, section, field, old_value: oldValue, new_value: newValue, details
      }]);
      // Silently refresh logs
      fetchLogs();
    } catch (e) {
      console.error("Log failed", e);
    }
  };

  // ====== ACTIONS ======
  const updateCmsValue = async (key, newValue, oldValue) => {
    if (newValue === oldValue) return;
    setSavingKey(key);
    
    const { error } = await supabase.from('content').update({ value: newValue }).eq('key', key);
    
    if (!error) {
       setCmsData(prev => prev.map(item => item.key === key ? { ...item, value: newValue } : item));
       // Create Log
       await writeLog({
         action: 'UPDATE',
         page: 'Home/Global',
         section: 'Content',
         field: key,
         oldValue: oldValue,
         newValue: newValue,
         details: `Updated text for ${key}`
       });
    } else {
       alert(`Failed to save: ${error.message}`);
    }
    setSavingKey(null);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/webp" }));
          }, "image/webp", 0.7);
        };
      };
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const year = form.year.value;
    const caption = form.caption.value;
    const files = form.files.files;

    if (!files.length) return;

    setLoading(true);
    setUploadStatus("Uploading...");

    let hasError = false;
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileType = file.type.startsWith('video') ? 'video' : 'image';
        
        if (fileType === 'image') file = await compressImage(file);

        const fileName = `${year}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);

        if (uploadError) { hasError = true; break; }

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

        const { error: dbError } = await supabase.from('media').insert([{ 
          year: parseInt(year), url: publicUrl, type: fileType, caption 
        }]);

        if (dbError) { hasError = true; break; }

        uploadedCount++;
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        // Create Log for each file
        await writeLog({
          action: 'ADD',
          page: `Gallery ${year}`,
          section: 'Media',
          field: fileType,
          newValue: file.name,
          details: `Added ${fileType} to ${year}`
        });
    }

    if (!hasError) {
      setUploadStatus(`Success! Uploaded ${uploadedCount} file(s).`);
      fetchMediaData();
      form.reset();
      setTimeout(() => { setUploadStatus(null); setUploadProgress(0); }, 3000);
    } else {
      setUploadStatus("Error uploading some files.");
    }
    
    setLoading(false);
  };

  const deleteMedia = async (id, url, year, type) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    
    // 1. Delete DB record
    const { error: dbError } = await supabase.from('media').delete().eq('id', id);
    if (!dbError) {
      // 2. Delete from storage
      const filePath = url.split('/public/media/')[1];
      if (filePath) await supabase.storage.from('media').remove([filePath]);
      
      setMediaList(prev => prev.filter(m => m.id !== id));
      
      // 3. Create Log
      await writeLog({
        action: 'DELETE',
        page: `Gallery ${year}`,
        section: 'Media',
        field: type,
        oldValue: url,
        details: `Deleted a ${type} from ${year}`
      });
    }
  };

  // ====== COMPUTED SUMMARY ======
  const summaryStats = useMemo(() => {
    const stats = { totalPhotos: 0, totalVideos: 0, changesToday: 0, yearStats: {} };
    
    mediaList.forEach(m => {
      if (m.type === 'video') stats.totalVideos++;
      else stats.totalPhotos++;
      
      if (!stats.yearStats[m.year]) stats.yearStats[m.year] = { count: 0, lastUpdate: '-' };
      stats.yearStats[m.year].count++;
    });

    const today = new Date().toDateString();
    logs.forEach(l => {
      if (new Date(l.created_at).toDateString() === today) stats.changesToday++;
      
      // Extract year from page 'Gallery 2024'
      const yearMatch = l.page && l.page.match(/\d{4}/);
      if (yearMatch && stats.yearStats[yearMatch[0]]) {
         if (stats.yearStats[yearMatch[0]].lastUpdate === '-') {
            stats.yearStats[yearMatch[0]].lastUpdate = new Date(l.created_at).toLocaleDateString();
         }
      }
    });

    return stats;
  }, [mediaList, logs]);


  // ====== RENDER ======
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Background rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glassCard w-full max-w-md p-10 border-white/10 bg-black/40 backdrop-blur-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-black rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-6 shadow-[0_0_30px_rgba(232,84,124,0.15)]">
              <Settings className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white italic tracking-wide">CMS Console</h1>
            <p className="text-white/40 text-xs mt-3 uppercase tracking-[0.2em] font-medium block">
              SECURE ACCESS PORTAL
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-accent/50 focus:bg-white/[0.05] transition-all placeholder:tracking-normal placeholder:text-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {loginError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400/90 text-sm text-center flex items-center justify-center gap-2 bg-red-500/10 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" /> {loginError}
              </motion.p>
            )}
            <button type="submit" className="btn-accent w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(232,84,124,0.2)]">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/[0.02] p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
               <Settings className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Admin <span className="text-accent">Workspace</span></h1>
                <p className="text-white/40 mt-1 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Online & Tracking
                </p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium">
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/[0.02] p-1.5 rounded-xl w-fit border border-white/5">
          {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                 activeTab === tab.id ? "bg-accent text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
               )}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Active Content wrapper */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10 min-h-[500px] shadow-2xl"
        >

          {/* =========================================================
              TAB: DASHBOARD / SUMMARY
          ========================================================= */}
          {activeTab === 'summary' && (
            <div className="space-y-10">
               <div>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                   <Activity className="text-accent w-6 h-6" /> System Overview
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
                      <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Total Assets</p>
                      <div className="flex items-end gap-3 text-white">
                         <span className="text-5xl font-black">{mediaList.length}</span>
                         <span className="text-white/40 pb-1">items</span>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm text-white/60">
                         <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4 text-accent/80" /> {summaryStats.totalPhotos}</span>
                         <span className="flex items-center gap-1"><Video className="w-4 h-4 text-accent/80" /> {summaryStats.totalVideos}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
                      <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Content Keys</p>
                      <div className="flex items-end gap-3 text-white">
                         <span className="text-5xl font-black">{cmsData.length}</span>
                         <span className="text-white/40 pb-1">fields</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-6">
                      <p className="text-accent/60 text-sm font-medium uppercase tracking-widest mb-4">Changes Today</p>
                      <div className="flex items-end gap-3 text-white">
                         <span className="text-5xl font-black">{summaryStats.changesToday}</span>
                         <span className="text-white/40 pb-1">actions logged</span>
                      </div>
                    </div>
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Page-wise Snapshot</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                          <th className="py-4 font-medium">Timeline Page</th>
                          <th className="py-4 font-medium text-center">Memories Inside</th>
                          <th className="py-4 font-medium text-right">Last Modified</th>
                          <th className="py-4 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-white/80">
                        {['2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
                           <tr key={year} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-5 font-bold text-white flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                   <Calendar className="w-3 h-3 text-accent" />
                                 </div>
                                 {year}
                              </td>
                              <td className="py-5 text-center font-mono">
                                 {summaryStats.yearStats[year]?.count || 0}
                              </td>
                              <td className="py-5 text-right text-white/50">
                                 {summaryStats.yearStats[year]?.lastUpdate || '-'}
                              </td>
                              <td className="py-5 text-center">
                                 {(summaryStats.yearStats[year]?.count || 0) > 0 ? (
                                   <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] uppercase font-bold">Populated</span>
                                 ) : (
                                   <span className="px-3 py-1 bg-white/5 text-white/30 rounded-full text-[10px] uppercase font-bold">Empty</span>
                                 )}
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>
          )}

          {/* =========================================================
              TAB: ACTIVITY LOGS
          ========================================================= */}
          {activeTab === 'history' && (
             <div className="space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
                 <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Action History</h2>
                    <p className="text-white/40 text-sm mt-1">Full audit trail of all CMS modifications</p>
                 </div>
                 
                 <div className="flex gap-3 bg-black/40 p-2 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 pl-2">
                       <Filter className="w-4 h-4 text-white/30" />
                    </div>
                    <select 
                       className="bg-transparent text-white/80 text-sm border-r border-white/10 pr-4 outline-none"
                       value={logFilterAction}
                       onChange={(e) => setLogFilterAction(e.target.value)}
                    >
                       <option value="ALL">All Actions</option>
                       <option value="ADD">Added (Uploads)</option>
                       <option value="UPDATE">Updated (Edits)</option>
                       <option value="DELETE">Deleted</option>
                    </select>
                    <select 
                       className="bg-transparent text-white/80 text-sm px-2 outline-none"
                       value={logFilterPage}
                       onChange={(e) => setLogFilterPage(e.target.value)}
                    >
                       <option value="ALL">All Pages</option>
                       <option value="Gallery 2021">2021 Gallery</option>
                       <option value="Gallery 2022">2022 Gallery</option>
                       <option value="Gallery 2023">2023 Gallery</option>
                       <option value="Gallery 2024">2024 Gallery</option>
                       <option value="Gallery 2025">2025 Gallery</option>
                       <option value="Gallery 2026">2026 Gallery</option>
                       <option value="Home/Global">Global Content</option>
                    </select>
                 </div>
               </div>

               <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                           <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Timestamp</th>
                           <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Action</th>
                           <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Target</th>
                           <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Details</th>
                           <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Changes</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-sm">
                        {loading && logs.length === 0 ? (
                           <tr><td colSpan="5" className="py-10 text-center text-white/40"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : logs
                           .filter(log => logFilterAction === 'ALL' || log.action === logFilterAction)
                           .filter(log => logFilterPage === 'ALL' || log.page === logFilterPage || (log.page && log.page.includes(logFilterPage))) // basic matching
                           .length === 0 ? (
                           <tr><td colSpan="5" className="py-10 text-center text-white/40">No activity logs found for this filter.</td></tr>
                        ) : logs
                           .filter(log => logFilterAction === 'ALL' || log.action === logFilterAction)
                           .filter(log => logFilterPage === 'ALL' || log.page === logFilterPage)
                           .map((log) => (
                           <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 whitespace-nowrap text-white/40 font-mono text-xs">
                                 <span className="block text-white/80">{format(new Date(log.created_at), 'MMM dd, yyyy')}</span>
                                 {format(new Date(log.created_at), 'hh:mm:ss a')}
                              </td>
                              <td className="py-4 px-6">
                                 <span className={cn(
                                    "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                                    log.action === 'ADD' ? "bg-green-500/10 text-green-400" :
                                    log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-400" :
                                    "bg-red-500/10 text-red-400"
                                 )}>
                                    {log.action}
                                 </span>
                              </td>
                              <td className="py-4 px-6">
                                 <span className="block font-medium text-white/90">{log.page || '-'}</span>
                                 <span className="text-xs text-white/40">Field: {log.field || '-'}</span>
                              </td>
                              <td className="py-4 px-6 text-white/60">
                                 {log.details || '-'}
                              </td>
                              <td className="py-4 px-6 text-xs font-mono max-w-xs truncate" title={`Old: ${log.old_value}\nNew: ${log.new_value}`}>
                                 {log.action === 'UPDATE' && (
                                    <div className="flex items-center gap-2">
                                       <span className="text-red-400/80 truncate line-through max-w-[80px]" title={log.old_value}>{log.old_value || 'null'}</span>
                                       <span className="text-white/30">→</span>
                                       <span className="text-green-400/80 truncate max-w-[80px]" title={log.new_value}>{log.new_value || 'null'}</span>
                                    </div>
                                 )}
                                 {log.action === 'ADD' && <span className="text-green-400/80 truncate">+ {log.new_value}</span>}
                                 {log.action === 'DELETE' && <span className="text-red-400/80 truncate">- {log.old_value}</span>}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             </div>
          )}


          {/* =========================================================
              TAB: UPLOAD
          ========================================================= */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto py-8">
                <form onSubmit={handleUpload} className="space-y-8 bg-black/20 p-8 rounded-2xl border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Target Timeline Year</label>
                       <select name="year" required className="input-field appearance-none bg-[#0a0a0a] border-white/10 text-lg py-3">
                          {[2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                             <option key={y} value={y}>{y} Gallery</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Select Assets</label>
                       <label className="flex items-center gap-4 cursor-pointer">
                          <div className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white w-full py-3.5 rounded-xl transition-colors font-medium text-sm">
                            <Upload className="w-4 h-4 text-accent" /> Browse Local Files
                          </div>
                          <input type="file" name="files" multiple accept="image/*,video/*" className="hidden" />
                       </label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Memory Caption (Optional)</label>
                    <textarea name="caption" rows="3" className="input-field bg-[#0a0a0a] resize-none py-4 border-white/10" placeholder="Describe this moment..."></textarea>
                  </div>

                  {uploadStatus && (
                    <motion.div 
                       initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                       className={cn(
                        "p-5 rounded-xl flex items-center gap-4 border",
                        uploadStatus.includes("Success") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-accent/10 border-accent/20 text-accent"
                    )}>
                      {uploadStatus.includes("Success") ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
                      <div className="w-full">
                        <p className="text-sm font-bold">{uploadStatus}</p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full bg-black/50 h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
                             <div className="bg-accent h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <button type="submit" disabled={loading} className="btn-accent w-full py-4 text-lg font-bold disabled:opacity-50">
                    {loading ? "Adding to timeline..." : "Upload Memories"}
                  </button>
                  
                  <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.2em] pt-4">
                    <span className="bg-white/5 px-2 py-1 rounded">Smart Compression Active</span> · Media optimized for speed
                  </div>
                </form>
            </div>
          )}

          {/* =========================================================
              TAB: MANAGE MEDIA
          ========================================================= */}
          {activeTab === 'manage' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-accent" /> Asset Library <span className="text-white/30 text-sm ml-2 font-normal">({mediaList.length} items)</span></h2>
                  <div className="bg-white/5 px-3 py-1.5 rounded-lg text-white/40 text-xs font-mono border border-white/10">Ordered by Newest</div>
               </div>
               
               {loading && mediaList.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse border border-white/10" />)}
                  </div>
               ) : mediaList.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                     <ImageIcon className="w-16 h-16 text-white/10 mb-4" />
                     <p className="text-white/40 text-lg">Your library is empty</p>
                     <button onClick={() => setActiveTab('upload')} className="text-accent hover:underline mt-2">Go to Add Memories</button>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {mediaList.map((item) => (
                      <div key={item.id} className="relative aspect-square group rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-lg">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                            <Video className="w-8 h-8 mb-2" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Video Video</span>
                          </div>
                        ) : (
                          <img src={item.url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                        )}
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white/90 text-[10px] px-2 py-1 rounded border border-white/10 font-bold uppercase tracking-wider">
                           {item.year}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                           <p className="text-white text-xs font-medium truncate mb-3">{item.caption || "No caption"}</p>
                           <button onClick={() => deleteMedia(item.id, item.url, item.year, item.type)} className="w-full py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-xl flex items-center justify-center gap-2 text-xs font-bold">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
             </div>
          )}

          {/* =========================================================
              TAB: CMS CONTENT
          ========================================================= */}
          {activeTab === 'content' && (
             <div className="max-w-3xl mx-auto space-y-8 py-4">
               <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                  <div>
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <Edit3 className="w-5 h-5 text-accent" /> Dynamic Content Variables
                     </h2>
                     <p className="text-white/40 text-sm mt-1">Changes are live immediately & logged in history</p>
                  </div>
               </div>

               {cmsLoading ? (
                  <div className="space-y-6">
                     {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />)}
                  </div>
               ) : cmsData.length > 0 ? (
                  <div className="space-y-6">
                    {cmsData.map((item) => (
                      <div key={item.key} className="glassCard border-white/10 bg-black/40 p-6 relative rounded-2xl transition-all hover:border-white/20">
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex gap-3">
                             <div className="mt-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                             </div>
                             <div>
                               <h3 className="text-white font-bold text-sm tracking-widest uppercase mb-1">{item.key.replace(/_/g, ' ')}</h3>
                               <p className="text-white/40 text-xs leading-relaxed max-w-lg">{item.description}</p>
                             </div>
                           </div>
                           {savingKey === item.key && <span className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-2 py-1 rounded"><Loader2 className="w-3 h-3 animate-spin" /> Saving</span>}
                         </div>
                         <div className="relative mt-4">
                           <textarea 
                             className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none overflow-hidden"
                             defaultValue={item.value}
                             rows={item.value.length > 100 ? 4 : 2}
                             onBlur={(e) => updateCmsValue(item.key, e.target.value, item.value)}
                           />
                         </div>
                      </div>
                    ))}
                  </div>
               ) : (
                 <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                   <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                   <p className="text-white/80 font-bold mb-2">No CMS keys found.</p>
                   <p className="text-white/40 text-sm">Please ensure cms_setup.sql has been executed in Supabase.</p>
                 </div>
               )}
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
