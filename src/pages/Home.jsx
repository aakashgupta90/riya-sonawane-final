import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight } from 'lucide-react';
import Countdown from '../components/Countdown';
import { useUnlockTime, TARGET_DATE } from '../hooks/useUnlockTime';
import { useCms } from '../hooks/useCms';

const Home = () => {
  const navigate = useNavigate();
  const [showEnter, setShowEnter] = useState(false);
  const isUnlocked = useUnlockTime();
  const cms = useCms();

  useEffect(() => {
    const timer = setTimeout(() => setShowEnter(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const floatingHearts = Array.from({ length: 15 });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6">
      {/* Background Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {floatingHearts.map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0.1, 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100 
            }}
            animate={{ 
              y: -200, 
              x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth) 
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute"
          >
            <Heart 
              className="text-accent fill-accent" 
              size={12 + Math.random() * 20} 
              style={{ opacity: 0.05 + Math.random() * 0.1 }} 
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-4xl text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-romantic text-2xl md:text-3xl text-accent/80 mb-6 italic"
        >
          {cms.home_typing_text}
        </motion.p>

        <motion.h1 
          className="text-5xl md:text-8xl font-heading font-black text-white mb-8 tracking-tighter"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {cms.home_title_main} <br/>
          <span className="text-accent">{cms.home_title_accent}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mb-12"
        >
          <Countdown 
            targetDate={TARGET_DATE} 
            onComplete={() => console.log("Happy Birthday! Unlocking modes...")} 
          />
        </motion.div>

        <AnimatePresence>
          {showEnter && isUnlocked && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => navigate('/story')}
              className="group relative inline-flex items-center gap-2 btn-accent overflow-hidden font-medium"
            >
              <span className="relative z-10">Check Out Our Story</span>
              <ChevronRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
          } else {
            document.exitFullscreen().catch(console.error);
          }
        }}
        className="absolute bottom-10 z-50 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
      >
         <span className="text-xs tracking-widest uppercase">Toggle Fullscreen Experience</span>
      </motion.button>

      {/* Aesthetic Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none opacity-50" />
    </div>
  );
};

export default Home;
