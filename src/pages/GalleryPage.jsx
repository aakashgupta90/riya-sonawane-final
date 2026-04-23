import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Heart, Image as ImageIcon,
  Video, Filter, ArrowUp, Sparkles, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constants ─────────────────────────────────────────────────────────────────
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const YEAR_SUBTITLES = {
  2021: 'Where it all started 🌟',
  2022: 'Growing closer every day 💫',
  2023: 'Memories we created together 🌸',
  2024: 'A year full of beautiful moments 🎀',
  2025: 'Moments that stayed in the heart 🥂',
  2026: 'The newest chapter of our story ✨',
};

// ─── Floating Heart ─────────────────────────────────────────────────────────────
const FloatingHeart = ({ left, size, duration, delay }) => (
  <motion.div
    className="pointer-events-none fixed select-none z-0 text-accent/10"
    style={{ left, fontSize: size, top: 0 }}
    initial={{ y: '110vh', opacity: 0 }}
    animate={{ y: '-10vh', opacity: [0, 0.35, 0.35, 0] }}
    transition={{ duration, ease: 'linear', repeat: Infinity, delay }}
  >
    ❤️
  </motion.div>
);

// ─── Single Media Card ──────────────────────────────────────────────────────────
const MediaCard = React.memo(({ item, index, onOpen, onBroken }) => {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  const handleError = () => {
    setBroken(true);
    onBroken(item.id);
  };

  if (broken) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.9) }}
      onClick={() => onOpen(item)}
      className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-2xl
                 border border-white/5 hover:border-accent/40 transition-all duration-500
                 shadow-lg hover:shadow-2xl hover:shadow-accent/10 mb-4"
    >
      {/* Skeleton */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-white/[0.04] animate-pulse rounded-2xl"
          style={{ minHeight: 180 }}
        />
      )}

      {item.type === 'video' ? (
        <div className="relative aspect-video bg-black/60">
          <video
            src={item.url}
            className={`w-full h-full object-cover transition-all duration-700
                        grayscale group-hover:grayscale-0 group-hover:scale-[1.05]
                        ${loaded ? 'opacity-100' : 'opacity-0'}`}
            preload="metadata"
            onLoadedData={() => setLoaded(true)}
            onError={handleError}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm
                            border border-white/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={item.url}
          alt={item.caption || `Memory ${item.year}`}
          loading="lazy"
          className={`w-full block transition-all duration-700
                      grayscale group-hover:grayscale-0 group-hover:scale-[1.05]
                      ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}

      {/* Year badge */}
      <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-white/70
                      text-[10px] px-2.5 py-1 rounded-full border border-white/10 font-bold
                      tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
        {item.year}
      </div>

      {/* Bottom caption overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-end p-4">
        {item.caption && (
          <p className="text-white text-xs font-medium drop-shadow-lg italic line-clamp-2">
            {item.caption}
          </p>
        )}
      </div>

      {/* Accent ring on hover */}
      <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-1
                      group-hover:ring-accent/30 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
});
MediaCard.displayName = 'MediaCard';

// ─── Fullscreen Modal ───────────────────────────────────────────────────────────
const FullscreenModal = ({ item, index, total, onClose, onPrev, onNext }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[2000] bg-black/97 backdrop-blur-xl
               flex items-center justify-center px-4"
    onClick={onClose}
  >
    {/* Close */}
    <button
      onClick={onClose}
      className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10
                 border border-white/10 flex items-center justify-center text-white
                 hover:bg-white/20 transition-colors z-10"
    >
      <X className="w-5 h-5" />
    </button>

    {/* Counter */}
    <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md
                    border border-white/10 px-4 py-1.5 rounded-full text-white/50 text-sm z-10 font-mono">
      {index + 1} / {total}
    </div>

    {/* Prev */}
    <button
      onClick={(e) => { e.stopPropagation(); onPrev(); }}
      className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                 bg-white/10 border border-white/10 flex items-center justify-center text-white
                 hover:bg-accent/20 hover:border-accent/30 transition-all z-10"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>

    {/* Next */}
    <button
      onClick={(e) => { e.stopPropagation(); onNext(); }}
      className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                 bg-white/10 border border-white/10 flex items-center justify-center text-white
                 hover:bg-accent/20 hover:border-accent/30 transition-all z-10"
    >
      <ChevronRight className="w-6 h-6" />
    </button>

    {/* Content */}
    <motion.div
      key={item.id}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-h-[85vh] max-w-5xl w-full flex flex-col items-center gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {item.type === 'video' ? (
        <video
          src={item.url}
          controls
          autoPlay
          className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl"
        />
      ) : (
        <img
          src={item.url}
          alt={item.caption || 'Memory'}
          className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl object-contain"
        />
      )}

      <div className="flex flex-col items-center gap-1">
        {item.caption && (
          <p className="text-white/70 font-romantic text-xl italic text-center px-4 max-w-xl">
            {item.caption}
          </p>
        )}
        <span className="flex items-center gap-1.5 text-accent/40 text-xs uppercase tracking-widest font-semibold">
          <Calendar className="w-3 h-3" /> {item.year}
        </span>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Year Section ───────────────────────────────────────────────────────────────
const YearSection = ({ year, items, onOpen, onBroken }) => {
  const [localBroken, setLocalBroken] = useState(new Set());

  const handleBroken = useCallback((id) => {
    setLocalBroken(prev => new Set([...prev, id]));
    onBroken(id);
  }, [onBroken]);

  const visible = items.filter(m => !localBroken.has(m.id));
  if (items.length === 0 || visible.length === 0) return null;

  return (
    <section id={`year-${year}`} className="mb-28">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end gap-5 mb-8"
      >
        <div className="flex-shrink-0">
          <p className="text-accent/50 text-[10px] uppercase tracking-[0.35em] font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Chapter
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white leading-none">
            {year}{' '}
            <span className="text-accent">Memories</span>
          </h2>
          <p className="text-white/35 text-sm mt-1.5 font-romantic italic">
            {YEAR_SUBTITLES[year]}
          </p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-accent/25 via-white/8 to-transparent mb-2" />
        <div className="mb-2 flex-shrink-0 bg-white/[0.04] border border-white/8 rounded-full
                        px-3 py-1 text-white/30 text-xs font-mono whitespace-nowrap">
          {visible.length} memories
        </div>
      </motion.div>

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {items.map((item, i) => (
          <MediaCard
            key={item.id}
            item={item}
            index={i}
            onOpen={onOpen}
            onBroken={handleBroken}
          />
        ))}
      </div>
    </section>
  );
};

// ─── Main Gallery Page ──────────────────────────────────────────────────────────
const GalleryPage = () => {
  // ── State ──
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [modalItem, setModalItem] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [globalBroken, setGlobalBroken] = useState(new Set());
  const [showBackTop, setShowBackTop] = useState(false);
  const topRef = useRef(null);

  // ── Floating hearts (stable) ──
  const hearts = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      left: `${5 + i * 9}%`,
      size: `${14 + (i % 4) * 5}px`,
      duration: 13 + (i % 5) * 3,
      delay: i * 1.3,
    })), []);

  // ── Fetch all media ──
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .order('year', { ascending: true })
          .order('created_at', { ascending: true });
        if (error) throw error;
        setAllMedia(data || []);
      } catch (e) {
        console.error('Gallery fetch error:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Back-to-top ──
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Global broken handler ──
  const handleGlobalBroken = useCallback((id) => {
    setGlobalBroken(prev => new Set([...prev, id]));
  }, []);

  // ── Derived data — must be computed before useEffect that uses them ──
  const byYear = useMemo(() => {
    const map = {};
    YEARS.forEach(y => { map[y] = allMedia.filter(m => m.year === y); });
    return map;
  }, [allMedia]);

  const yearsWithData = useMemo(
    () => YEARS.filter(y => (byYear[y] || []).length > 0),
    [byYear]
  );

  const filteredMedia = useMemo(() =>
    allMedia.filter(m => {
      if (globalBroken.has(m.id)) return false;
      if (activeFilter === 'ALL') return true;
      return m.year === parseInt(activeFilter);
    }),
    [allMedia, globalBroken, activeFilter]
  );

  const stats = useMemo(() => ({
    total: allMedia.length,
    photos: allMedia.filter(m => m.type === 'image').length,
    videos: allMedia.filter(m => m.type === 'video').length,
    years: yearsWithData.length,
  }), [allMedia, yearsWithData]);

  // ── Modal helpers — defined after filteredMedia ──
  const navigateModal = useCallback((dir) => {
    const len = filteredMedia.length;
    if (!len) return;
    const newIdx = dir === 'next'
      ? (modalIndex + 1) % len
      : (modalIndex - 1 + len) % len;
    setModalIndex(newIdx);
    setModalItem(filteredMedia[newIdx]);
  }, [filteredMedia, modalIndex]);

  const openModal = useCallback((item) => {
    const idx = filteredMedia.findIndex(m => m.id === item.id);
    setModalIndex(idx >= 0 ? idx : 0);
    setModalItem(item);
  }, [filteredMedia]);

  // ── Keyboard nav ──
  useEffect(() => {
    const handler = (e) => {
      if (!modalItem) return;
      if (e.key === 'ArrowRight') navigateModal('next');
      if (e.key === 'ArrowLeft') navigateModal('prev');
      if (e.key === 'Escape') setModalItem(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalItem, navigateModal]);

  // ── Scroll to top ──
  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div ref={topRef} className="min-h-screen bg-[#030303] pt-28 pb-32 relative overflow-x-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[500px] h-[500px]
                      bg-accent/5 rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-[400px] h-[400px]
                      bg-pink-900/8 rounded-full blur-[110px] -z-10" />

      {/* Floating hearts */}
      {hearts.map((h, i) => <FloatingHeart key={i} {...h} />)}

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* ── HERO ──────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
            className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20
                       rounded-full px-5 py-2 text-accent text-xs uppercase tracking-[0.3em]
                       font-bold mb-8"
          >
            <Heart className="w-3 h-3 fill-accent" /> Memory Archive
          </motion.div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black
                         text-white tracking-tighter leading-[0.9] mb-6">
            Gallery{' '}
            <span className="shimmer-text">2021 – 2026</span>
          </h1>

          <p className="font-romantic text-2xl md:text-3xl text-white/45 italic max-w-xl mx-auto mb-12">
            Every memory, every smile, every moment with you ❤️
          </p>

          {/* Stats */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {[
                { label: 'All Memories', value: stats.total },
                { label: 'Photos', value: stats.photos },
                { label: 'Videos', value: stats.videos },
                { label: 'Years', value: stats.years },
              ].map(s => (
                <div key={s.label}
                  className="bg-white/[0.03] border border-white/8 rounded-2xl px-6 py-4
                             hover:border-accent/20 transition-colors duration-300">
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-white/30 text-xs uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── FILTER BAR ────────────────────────────────────────────────────────── */}
        {!loading && yearsWithData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10"
          >
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/8
                            rounded-2xl p-1.5 flex-wrap justify-center">
              <div className="flex items-center gap-1 px-2">
                <Filter className="w-3.5 h-3.5 text-white/25" />
              </div>
              {['ALL', ...yearsWithData.map(String)].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                              ${activeFilter === f
                      ? 'bg-accent text-white shadow-lg shadow-accent/25'
                      : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {f === 'ALL' ? 'All' : f}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── YEAR JUMP LINKS (only in ALL mode) ───────────────────────────────── */}
        {activeFilter === 'ALL' && !loading && yearsWithData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap justify-center gap-2 mb-14"
          >
            {yearsWithData.map(y => (
              <a
                key={y}
                href={`#year-${y}`}
                className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-accent/10
                           border border-white/8 hover:border-accent/30 rounded-xl px-4 py-2
                           text-white/35 hover:text-accent text-sm font-medium
                           transition-all duration-300 group"
              >
                <Calendar className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                {y}
                <span className="text-[10px] text-white/20 group-hover:text-accent/50 font-mono">
                  {(byYear[y] || []).length}
                </span>
              </a>
            ))}
          </motion.div>
        )}

        {/* ── COMBINED GALLERY ──────────────────────────────────────────────────── */}
        {loading ? (
          // Skeleton
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mb-24">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-2xl bg-white/[0.04] animate-pulse
                           border border-white/5 mb-4"
                style={{ height: `${150 + (i % 4) * 55}px` }}
              />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl mb-24">
            <ImageIcon className="w-14 h-14 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-lg">No memories found</p>
          </div>
        ) : (
          <>
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 mb-8"
            >
              <div>
                <p className="text-accent/45 text-[10px] uppercase tracking-[0.35em] font-bold mb-1">
                  {activeFilter === 'ALL' ? 'Complete Collection' : `${activeFilter} Gallery`}
                </p>
                <h2 className="text-3xl md:text-4xl font-heading font-black text-white">
                  All <span className="text-accent">Memories</span>
                </h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
              <div className="bg-white/[0.04] border border-white/8 rounded-full px-3 py-1
                              text-white/30 text-xs font-mono flex-shrink-0">
                {filteredMedia.length} items
              </div>
            </motion.div>

            {/* Masonry grid - ALL combined */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mb-32">
              {filteredMedia.map((item, i) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={openModal}
                  onBroken={handleGlobalBroken}
                />
              ))}
            </div>
          </>
        )}

        {/* ── YEAR-BY-YEAR SECTIONS (ALL mode only) ────────────────────────────── */}
        {activeFilter === 'ALL' && !loading && (
          <div>
            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 mb-20"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
              <div className="text-center flex-shrink-0">
                <Heart className="w-5 h-5 text-accent/50 mx-auto fill-accent/20" />
                <p className="text-accent/35 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
                  Year by Year
                </p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
            </motion.div>

            {YEARS.map(y => (
              <YearSection
                key={y}
                year={y}
                items={byYear[y] || []}
                onOpen={openModal}
                onBroken={handleGlobalBroken}
              />
            ))}
          </div>
        )}

      </div>{/* /max-w */}

      {/* ── FULLSCREEN MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalItem && (
          <FullscreenModal
            item={modalItem}
            index={modalIndex}
            total={filteredMedia.length}
            onClose={() => setModalItem(null)}
            onPrev={() => navigateModal('prev')}
            onNext={() => navigateModal('next')}
          />
        )}
      </AnimatePresence>

      {/* ── BACK TO TOP ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-6 z-50 w-12 h-12 rounded-full bg-accent
                       shadow-lg shadow-accent/40 flex items-center justify-center
                       text-white hover:bg-accent-hover hover:scale-110 transition-all duration-300"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GalleryPage;
