import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Heart, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SecretSurprise = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('warning'); // warning -> error -> surprise
  const [glitchText, setGlitchText] = useState('');

  const errorTexts = [
    'SYSTEM ERROR 404',
    'HEART_OVERFLOW_EXCEPTION',
    'Too much love detected...',
    'FEELINGS.exe has stopped working',
    'Buffer overflow: emotions exceeded limit',
  ];

  useEffect(() => {
    if (phase === 'error') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < errorTexts.length) {
          setGlitchText(errorTexts[i]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('surprise');
            // Big confetti
            const duration = 5000;
            const end = Date.now() + duration;
            const interval2 = setInterval(() => {
              if (Date.now() > end) return clearInterval(interval2);
              confetti({
                particleCount: 30,
                spread: 100,
                origin: { x: Math.random(), y: Math.random() * 0.5 },
                colors: ['#e8547c', '#ff69b4', '#fff', '#ffd700'],
              });
            }, 200);
          }, 1000);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleWarningClick = () => {
    setPhase('error');
    try {
      const audio = document.getElementById('clickSound');
      if (audio) audio.play();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Warning */}
        {phase === 'warning' && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center relative z-10 max-w-md"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <AlertTriangle className="w-20 h-20 text-yellow-400" />
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-heading font-black text-white mb-4">
              ⚠️ Warning
            </h1>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              This page contains something extremely dangerous...
              <br/>
              <span className="text-white/30 text-sm">
                (Are you sure you want to continue?)
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWarningClick}
                className="btn-accent text-lg py-4 flex items-center justify-center gap-2"
              >
                I'm brave. Show me 😈
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => navigate(-1)}
                className="text-white/20 text-sm hover:text-white/40 transition-colors"
              >
                No, take me back (coward option 😂)
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Fake Error */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-center relative z-10 max-w-lg"
          >
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />

              <motion.p
                key={glitchText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-mono text-lg mb-2"
              >
                {glitchText}
              </motion.p>

              <div className="mt-4 space-y-1">
                {errorTexts.slice(0, errorTexts.indexOf(glitchText) + 1).map((t, i) => (
                  <p key={i} className="text-red-400/30 font-mono text-xs">
                    [{String(i).padStart(3, '0')}] {t}
                  </p>
                ))}
              </div>

              <motion.div
                className="mt-6 h-2 bg-red-900/30 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-red-500/50 rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Surprise */}
        {phase === 'surprise' && (
          <motion.div
            key="surprise"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-center relative z-10 max-w-lg"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: 2 }}
              className="inline-block mb-8"
            >
              <Heart className="w-24 h-24 text-accent fill-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-heading font-black text-white mb-6"
            >
              Plot Twist! 🎉
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 mb-8"
            >
              <p className="font-romantic text-2xl md:text-3xl text-accent italic leading-relaxed">
                "The only error in my life…
              </p>
              <p className="font-romantic text-2xl md:text-3xl text-accent italic leading-relaxed">
                …was not finding you sooner 💖"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="space-y-4"
            >
              <p className="text-white/30 text-sm">
                See? Nothing dangerous here. Just love 🥺
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/final')}
                className="btn-accent text-lg px-10 py-4 inline-flex items-center gap-3 glow-pulse"
              >
                <Sparkles className="w-5 h-5" />
                Your Final Surprise Awaits
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretSurprise;
