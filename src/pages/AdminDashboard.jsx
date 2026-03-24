import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Edit3, Settings, LogOut, CheckCircle, AlertTriangle, Loader2, Image as ImageIcon, Video, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // CMS State
  const [cmsData, setCmsData] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  
  // Tabs
  const tabs = [
    { id: 'upload', name: 'Upload Media', icon: <Upload className="w-4 h-4" /> },
    { id: 'manage', name: 'Manage Media', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'content', name: 'Edit Content', icon: <Edit3 className="w-4 h-4" /> },
  ];

  useEffect(() => {
    // Check local storage for persistent session
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession === 'active') {
      setIsAuthenticated(true);
      fetchMediaData();
      fetchCmsData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'hunny2026';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_session', 'active');
      fetchMediaData();
      fetchCmsData();
    } else {
      setLoginError("Invalid password. Access denied.");
    }
  };

  const fetchCmsData = async () => {
    setCmsLoading(true);
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('key', { ascending: true });
    if (!error) setCmsData(data || []);
    setCmsLoading(false);
  };

  const updateCmsValue = async (key, newValue) => {
    setSavingKey(key);
    const { error } = await supabase
      .from('content')
      .update({ value: newValue })
      .eq('key', key);
    
    if (error) {
       alert(`Failed to save: ${error.message}`);
    } else {
       // local update
       setCmsData(prev => prev.map(item => item.key === key ? { ...item, value: newValue } : item));
    }
    setSavingKey(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  const fetchMediaData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setMediaList(data || []);
    setLoading(false);
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

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileType = file.type.startsWith('video') ? 'video' : 'image';
        
        // Compress image if needed
        if (fileType === 'image') {
          file = await compressImage(file);
        }

        const fileName = `${year}/${Date.now()}_${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Storage Error:", uploadError);
          setUploadStatus(`Error: Storage - ${uploadError.message}`);
          hasError = true;
          break;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('media')
          .insert([{ 
            year: parseInt(year), 
            url: publicUrl, 
            type: fileType, 
            caption 
          }]);

        if (dbError) {
          console.error("DB Error:", dbError);
          setUploadStatus(`Error: Database - ${dbError.message}`);
          hasError = true;
          break;
        }

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    if (!hasError) {
      setUploadStatus("Success! All memories uploaded.");
      fetchMediaData();
      form.reset();
      setTimeout(() => {
        setUploadStatus(null);
        setUploadProgress(0);
      }, 3000);
    }
    
    setLoading(false);
  };

  const deleteMedia = async (id, url) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    
    // 1. Delete DB record
    const { error: dbError } = await supabase.from('media').delete().eq('id', id);
    if (dbError) {
        alert("Failed to delete record");
        return;
    }

    // 2. Delete from storage (Extract file path from URL)
    const filePath = url.split('/public/media/')[1];
    if (filePath) {
        await supabase.storage.from('media').remove([filePath]);
    }
    
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glassCard w-full max-w-md p-10 border-white/5 bg-white/[0.03]"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
              <Settings className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white italic">Admin Access</h1>
            <p className="text-white/40 text-sm mt-2 font-medium">To manage Hunny's memories...</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Secret Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field py-3 text-lg text-center tracking-widest placeholder:tracking-normal"
                placeholder="••••••••"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-xs text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-3 h-3" /> {loginError}
              </p>
            )}
            <button type="submit" className="btn-accent w-full py-4 text-lg font-bold">
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white">Admin <span className="text-accent">Control</span></h1>
            <p className="text-white/40 mt-1 uppercase tracking-widest text-xs">Manage the experience</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                 activeTab === tab.id ? "bg-accent text-white shadow-lg" : "text-white/40 hover:text-white/70"
               )}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Active Content */}
        <div className="glassCard border-white/5 bg-white/[0.02] p-8 min-h-[500px]">
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest text-white/40">Select Year</label>
                       <select name="year" required className="input-field appearance-none bg-black">
                          {[2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                             <option key={y} value={y}>{y}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest text-white/40">Media Files (PNG, JPG, MP4)</label>
                       <label className="flex items-center gap-4 cursor-pointer">
                          <div className="btn-accent flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border-white/10 text-white w-full text-sm">
                            <Upload className="w-4 h-4" /> Choose Files
                          </div>
                          <input type="file" name="files" multiple accept="image/*,video/*" className="hidden" />
                       </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Caption (Optional)</label>
                    <textarea name="caption" rows="3" className="input-field resize-none py-4" placeholder="Say something beautiful..."></textarea>
                  </div>

                  {uploadStatus && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-center gap-4",
                        uploadStatus.includes("Success") ? "bg-green-500/10 text-green-400" : "bg-accent/10 text-accent"
                    )}>
                      {uploadStatus.includes("Success") ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
                      <div className="w-full">
                        <p className="text-sm font-bold">{uploadStatus}</p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                             <div className="bg-accent h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-accent w-full py-4 text-lg font-bold disabled:opacity-50">
                    {loading ? "Processing..." : "Finish Upload"}
                  </button>
                  
                  <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.2em]">
                    Compressed on device · Max 1200px width
                  </div>
                </form>
            </div>
          )}

          {activeTab === 'manage' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-accent" /> Library ({mediaList.length})</h2>
                  <div className="text-white/40 text-sm">Sorted by newest first</div>
               </div>
               
               {loading && mediaList.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {mediaList.map((item) => (
                      <div key={item.id} className="relative aspect-square group rounded-xl overflow-hidden border border-white/10">
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                            <Video className="w-8 h-8" />
                          </div>
                        ) : (
                          <img src={item.url} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-md font-bold">
                           {item.year}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button onClick={() => deleteMedia(item.id, item.url)} className="p-2.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-xl">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
             </div>
          )}

          {activeTab === 'content' && (
             <div className="max-w-3xl mx-auto space-y-6">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-accent" /> Text & Content Manager
                  </h2>
                  <div className="text-white/40 text-sm">Updates appear instantly on website</div>
               </div>

               {cmsLoading ? (
                  <div className="space-y-4">
                     {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
                  </div>
               ) : cmsData.length > 0 ? (
                  <div className="space-y-6">
                    {cmsData.map((item) => (
                      <div key={item.key} className="glassCard border-white/5 bg-white/[0.02] p-6 relative">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h3 className="text-accent font-bold text-sm tracking-widest uppercase mb-1">{item.key.replace(/_/g, ' ')}</h3>
                             <p className="text-white/40 text-xs">{item.description}</p>
                           </div>
                           {savingKey === item.key && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                         </div>
                         <textarea 
                           className="input-field w-full resize-y min-h-[60px] text-sm py-3"
                           defaultValue={item.value}
                           onBlur={(e) => {
                             if (e.target.value !== item.value) {
                               updateCmsValue(item.key, e.target.value);
                             }
                           }}
                           placeholder="Type to edit..."
                         />
                         <p className="text-[10px] text-white/20 mt-2 text-right uppercase tracking-widest">Auto-saves on clicking away</p>
                      </div>
                    ))}
                  </div>
               ) : (
                 <div className="text-center py-20 text-white/40">
                   No CMS keys found. Please run the cms_setup.sql file in your Supabase dashboard!
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
