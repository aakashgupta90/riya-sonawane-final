import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Video, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const YearGallery = () => {
  const { year } = useParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    setMedia([]);
    setBrokenIds(new Set());
    setError(null);
    fetchMedia();
  }, [year]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('year', parseInt(year))
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMedia(data || []);
    } catch (err) {
      console.error('Error fetching media:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark an image as broken — it will be hidden from grid
  const handleImageError = useCallback((id) => {
    setBrokenIds(prev => new Set([...prev, id]));
  }, []);

  // Only count non-broken visible media
  const visibleMedia = media.filter(m => !brokenIds.has(m.id));

  const openModal = (item) => {
    const idx = visibleMedia.findIndex(m => m.id === item.id);
    setSelectedMedia(item);
    setCurrentIndex(idx);
  };

  const closeModal = () => setSelectedMedia(null);

  const navigateModal = (direction) => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % visibleMedia.length
      : (currentIndex - 1 + visibleMedia.length) % visibleMedia.length;
    setCurrentIndex(newIndex);
    setSelectedMedia(visibleMedia[newIndex]);
  };

  // Keyboard navigation in modal
  useEffect(() => {
    const handleKey = (e) => {
      if (!selectedMedia) return;
      if (e.key === 'ArrowRight') navigateModal('next');
      if (e.key === 'ArrowLeft') navigateModal('prev');
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedMedia, currentIndex, visibleMedia]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-2 tracking-tighter">
              Gallery <span className="text-accent">{year}</span>
            </h1>
            <p className="font-romantic text-2xl text-accent/80 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> All the memories from {year}
            </p>
            {!loading && (
              <p className="text-white/30 text-sm mt-2 tracking-widest uppercase">
                {visibleMedia.length} memories
                {brokenIds.size > 0 && (
                  <span className="text-yellow-500/50 ml-2">
                    ({brokenIds.size} couldn't load)
                  </span>
                )}
              </p>
            )}
          </motion.div>

          <Link to="/story" className="btn-accent flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10">
            <ChevronLeft className="w-4 h-4" /> Back to Story
          </Link>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Failed to load gallery: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-2xl bg-white/5 animate-pulse border border-white/5"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No memories found for {year} yet.</p>
            <Link to="/admin" className="text-accent underline hover:text-accent-hover mt-4 inline-block">
              Add some memories
            </Link>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {media.map((item, index) => {
              const isBroken = brokenIds.has(item.id);
              if (isBroken) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 1.5) }}
                  onClick={() => openModal(item)}
                  className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-300"
                >
                  {item.type === 'video' ? (
                    <div className="relative aspect-video bg-black">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        preload="metadata"
                        onError={() => handleImageError(item.id)}
                      />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                        <Video className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || `Memory from ${year}`}
                      className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03] block"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {item.caption && (
                      <p className="text-white text-xs font-medium drop-shadow-lg truncate">{item.caption}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/97 flex items-center justify-center px-4"
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-[1001] border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            <button
              onClick={() => navigateModal('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-[1001] md:left-8 border border-white/10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next */}
            <button
              onClick={() => navigateModal('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-[1001] md:right-8 border border-white/10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-white/60 text-sm font-medium">
              {currentIndex + 1} / {visibleMedia.length}
            </div>

            <div className="w-full max-w-6xl flex flex-col items-center">
              <motion.div
                key={selectedMedia.id}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative max-h-[82vh] w-full flex items-center justify-center"
              >
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="max-h-full max-w-full rounded-xl shadow-2xl"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt="Memory"
                    className="max-h-[82vh] max-w-full rounded-xl shadow-2xl object-contain"
                  />
                )}
              </motion.div>
              {selectedMedia.caption && (
                <p className="mt-6 text-white/80 font-romantic text-xl italic text-center max-w-2xl px-4">
                  {selectedMedia.caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearGallery;
