import React, { useState, useEffect, useRef } from 'react';
import { Music, Music2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCms } from '../hooks/useCms';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const cms = useCms();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Autoplay prevented:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <audio
        ref={audioRef}
        src={cms.music_url}
        loop
      />
      
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="accent-accent w-24 cursor-pointer"
            />
            {volume === 0 ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-white/50" />}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-12 h-12 rounded-full glassCard p-0 flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 group"
          title="Audio Settings"
        >
          {isPlaying ? <Music className="w-5 h-5 text-accent animate-spin-slow" /> : <Music2 className="w-5 h-5 text-white/50 group-hover:text-white" />}
        </button>
        
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 active:scale-90"
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
