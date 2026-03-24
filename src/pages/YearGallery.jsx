import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Video, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const YearGallery = () => {
  const { year } = useParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchMedia();
  }, [year]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('year', parseInt(year))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item, index) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const navigateModal = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % media.length 
      : (currentIndex - 1 + media.length) % media.length;
    setCurrentIndex(newIndex);
    setSelectedMedia(media[newIndex]);
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-2 tracking-tighter">
              Gallery <span className="text-accent">{year}</span>
            </h1>
            <p className="font-romantic text-2xl text-accent/80 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> All the memories from {year}
            </p>
          </motion.div>

          <Link to="/story" className="btn-accent flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10">
            <ChevronLeft className="w-4 h-4" /> Back to Story
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : media.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => openModal(item, index)}
                className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-white/5"
              >
                {item.type === 'video' ? (
                  <div className="relative aspect-video">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || 'Memory'}
                    className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  {item.caption && <p className="text-white text-xs font-medium drop-shadow-lg truncate">{item.caption}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No memories found for {year} yet.</p>
            <Link to="/admin" className="text-accent underline hover:text-accent-hover mt-4 inline-block">Add some memories</Link>
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
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center px-4"
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 rounded-full glassCard flex items-center justify-center text-white hover:bg-white/10 transition-colors z-[1001]"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigateModal('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glassCard flex items-center justify-center text-white hover:bg-white/10 transition-colors z-[1001] md:left-8"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={() => navigateModal('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glassCard flex items-center justify-center text-white hover:bg-white/10 transition-colors z-[1001] md:right-8"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="w-full max-w-6xl flex flex-col items-center">
              <motion.div
                key={selectedMedia.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative max-h-[80vh] w-full flex items-center justify-center"
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
                    className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
                  />
                )}
              </motion.div>
              {selectedMedia.caption && (
                <p className="mt-8 text-white/80 font-romantic text-2xl italic text-center max-w-2xl px-4">{selectedMedia.caption}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearGallery;
