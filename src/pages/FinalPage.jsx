import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Gift, Star } from 'lucide-react';
import { useCms } from '../hooks/useCms';
import Typewriter from '../components/Typewriter';
import StarField from '../components/StarField';

const FinalPage = () => {
  const [phase, setPhase] = useState(0); // 0: intro, 1: letter, 2: reasons, 3: finale
  const [messagesRevealed, setMessagesRevealed] = useState(0);
  const [letterDone, setLetterDone] = useState(false);
  const [showHeartRain, setShowHeartRain] = useState(false);
  const cms = useCms();

  // Heart rain particles
  const heartRainItems = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 24,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
    }));
  }, []);

  // Auto-start sequence
  useEffect(() => {
    const t1 = setTimeout(() => {
      // Initial confetti burst
      handleConfetti();
      setPhase(1);
    }, 1500);

    return () => clearTimeout(t1);
  }, []);

  const handleConfetti = () => {
    const duration = 8 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleLetterDone = () => {
    setLetterDone(true);
    setTimeout(() => setPhase(2), 1000);
  };

  const extraMessages = [
    "You are my favorite distraction. ❤️",
    "I'm so lucky to have you in my life. ✨",
    "Every day is a celebration when I think of you. 🌹",
    "You make my world so much brighter. 🌟",
    "Your smile could light up an entire city. 💡",
    "I love every version of you. 💞",
    "Even on bad days, you're the best thing. 🌈",
  ];

  const revealNextMessage = () => {
    if (messagesRevealed < extraMessages.length) {
      setMessagesRevealed(prev => prev + 1);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e8547c', '#ffffff', '#ff0000', '#ffd700'],
      });

      // Start heart rain on last message
      if (messagesRevealed + 1 >= extraMessages.length) {
        setShowHeartRain(true);
        setPhase(3);
        handleConfetti();
      }

      try {
        const audio = document.getElementById('clickSound');
        if (audio) { audio.currentTime = 0; audio.play(); }
      } catch (e) {}
    }
  };

  const loveLetter = `Dear Hunny,

If you're reading this, it means I managed to create something just for you.
Every line of code, every animation, every word — it's all for you.

You came into my life and changed everything.
Not dramatically, not all at once…
But slowly, beautifully, completely.

Happy Birthday, my special person.
You deserve every beautiful thing this world has to offer.

And no matter what happens…
You are, and always will be, special to me.

— With all my heart 💖`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20 pb-20 px-6 overflow-hidden relative">
      <StarField count={50} />

      {/* Heart Rain */}
      {showHeartRain && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {heartRainItems.map((h) => (
            <div
              key={h.id}
              style={{
                position: 'absolute',
                left: `${h.left}%`,
                top: '-5%',
                fontSize: `${h.size}px`,
                animation: `heartFall ${h.duration}s linear ${h.delay}s infinite`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        {/* Phase 0: Intro Animation */}
        <AnimatePresence>
          {phase === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-32 h-32 text-accent fill-accent" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-romantic text-2xl text-accent mt-8"
              >
                Something special is loading...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1: Auto-typing Love Letter */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Big Heart */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative inline-block mb-8"
            >
              <div className="absolute -inset-6 bg-accent/20 blur-3xl rounded-full" />
              <Heart className="w-20 h-20 md:w-24 md:h-24 text-accent fill-accent shadow-2xl relative" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3"
              >
                <Sparkles className="w-8 h-8 text-white/50" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-8xl font-heading font-black text-white leading-tight mb-4"
            >
              Happy Birthday, <br/>
              <span className="shimmer-text">Hunny ❤️</span>
            </motion.h1>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-romantic text-xl md:text-2xl text-white/60 max-w-2xl mx-auto italic leading-relaxed mb-12"
            >
              "{cms.final_message_quote}"
            </motion.p>

            {/* Auto-typing Love Letter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="max-w-2xl mx-auto text-left"
            >
              <div className="glassCard border-accent/10 bg-accent/[0.02]">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <Heart className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-accent/60 text-xs uppercase tracking-widest font-medium">
                    A Letter For You
                  </span>
                </div>
                <div className="font-romantic text-lg md:text-xl text-white/70 leading-relaxed whitespace-pre-line">
                  <Typewriter
                    text={loveLetter}
                    speed={20}
                    delay={2000}
                    onComplete={handleLetterDone}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Reveal Messages */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
              <Star className="w-4 h-4 text-accent/60" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
            </div>

            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              What you mean to me...
            </h2>

            {/* Revealed messages */}
            <div className="flex flex-wrap justify-center gap-3">
              {extraMessages.slice(0, messagesRevealed).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' }}
                  className="glassCard py-3 px-6 text-white font-medium border-accent/20 bg-accent/5 backdrop-blur-md rounded-full shadow-lg shadow-accent/10"
                >
                  {msg}
                </motion.div>
              ))}
            </div>

            {/* Reveal button */}
            <motion.button
              onClick={revealNextMessage}
              disabled={messagesRevealed >= extraMessages.length}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-accent inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-lg px-8 py-4"
            >
              <Gift className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="relative z-10">
                {messagesRevealed === 0 ? "What am I to you?" :
                 messagesRevealed < extraMessages.length ? "Tell me more..." :
                 "You are everything to me ❤️"}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        )}

        {/* Phase 3: Grand Finale */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-16 pt-16 border-t border-white/5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 1 }}
                className="mb-8"
              >
                <p className="text-6xl mb-4">🎉</p>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-3xl md:text-5xl font-heading font-black text-white mb-6 leading-tight"
              >
                No matter what happens…<br/>
                <span className="shimmer-text text-4xl md:text-6xl">
                  You are special to me 💖
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-white/30 text-sm tracking-widest uppercase"
              >
                Made with love, just for you 🤍
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ delay: 4, duration: 3, repeat: Infinity }}
                className="text-white/15 text-xs mt-8"
              >
                If you're still here… it proves you care too 💖
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decorative Rings */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full border border-white/5 opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full border border-white/10 opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full border border-accent/10 opacity-5" />
      </div>
    </div>
  );
};

export default FinalPage;
