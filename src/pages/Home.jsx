import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, Sparkles } from 'lucide-react';
import Countdown from '../components/Countdown';
import Typewriter from '../components/Typewriter';
import FloatingHearts from '../components/FloatingHearts';
import StarField from '../components/StarField';
import { useUnlockTime, TARGET_DATE } from '../hooks/useUnlockTime';
import { useCms } from '../hooks/useCms';

const Home = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const isUnlocked = useUnlockTime();
  const cms = useCms();

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500);
    const t2 = setTimeout(() => setShowButton(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Can't sleep? 🌙 I'm glad you're here...";
    if (hour < 12) return "Good Morning, Sunshine ☀️";
    if (hour < 17) return "Hope your day is beautiful 🌸";
    if (hour < 21) return "Good Evening, Beautiful 🌆";
    return "Sweet Dreams ahead 🌙";
  };

  const handleTypingComplete = useCallback(() => {
    setTypingDone(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6">
      <StarField count={40} />
      <FloatingHearts count={12} />

      {/* Radial gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-4xl text-center"
      >
        {/* Time-based greeting */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/30 text-sm tracking-[0.3em] uppercase mb-8"
        >
          {getTimeGreeting()}
        </motion.p>

        {/* Typewriter text */}
        {showContent && (
          <div className="font-romantic text-2xl md:text-3xl text-accent/80 mb-8 italic min-h-[2.5rem]">
            <Typewriter
              text={cms.home_typing_text}
              speed={40}
              delay={500}
              onComplete={handleTypingComplete}
            />
          </div>
        )}

        {/* Main title with shimmer */}
        <motion.h1
          className="text-5xl md:text-8xl font-heading font-black text-white mb-4 tracking-tighter"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {cms.home_title_main} <br/>
          <span className="shimmer-text">{cms.home_title_accent}</span>
        </motion.h1>

        {/* Sparkle divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex items-center justify-center gap-3 my-6"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
          <Sparkles className="w-4 h-4 text-accent/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mb-12"
        >
          <Countdown
            targetDate={TARGET_DATE}
            onComplete={() => console.log("Happy Birthday! Unlocking...")}
          />
          <p className="text-white/20 text-xs tracking-widest uppercase mt-4">
            {isUnlocked ? "🎉 It's time to celebrate!" : "Until the magic begins..."}
          </p>
        </motion.div>

        {/* Enter button */}
        <AnimatePresence>
          {showButton && isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              <motion.button
                onClick={() => navigate('/story')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 btn-accent text-lg px-10 py-4 overflow-hidden glow-pulse"
              >
                <Heart className="w-5 h-5 fill-white" />
                <span className="relative z-10 font-bold">Enter Our World</span>
                <ChevronRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint popup */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 3, delay: 5, repeat: Infinity }}
              className="text-white/20 text-xs mt-12 tracking-widest"
            >
              If you're reading this… you matter 💖
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
          } else {
            document.exitFullscreen().catch(console.error);
          }
        }}
        className="absolute bottom-10 z-50 flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
      >
        <span className="text-xs tracking-widest uppercase">🖥️ Fullscreen Experience</span>
      </motion.button>

      {/* Bottom gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Home;
