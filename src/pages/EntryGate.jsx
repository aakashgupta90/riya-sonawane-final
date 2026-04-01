import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Unlock, Sparkles } from 'lucide-react';
import StarField from '../components/StarField';

const EntryGate = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [hearts, setHearts] = useState([]);

  // Floating hearts on background
  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => [...prev.slice(-15), {
        id: Date.now(),
        x: Math.random() * 100,
        size: 12 + Math.random() * 16,
      }]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sitePassword = import.meta.env.VITE_SITE_PASSWORD || 'hunny2026';

    if (password === sitePassword) {
      setUnlocking(true);
      // Play click sound
      try {
        const audio = document.getElementById('clickSound');
        if (audio) audio.play();
      } catch (e) {}

      setTimeout(() => {
        localStorage.setItem('site_unlocked', 'true');
        onUnlock();
      }, 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Late night, huh? 🌙";
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    if (hour < 21) return "Good Evening 🌆";
    return "Good Night 🌙";
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center px-6 overflow-hidden">
      <StarField count={60} />

      {/* Floating hearts */}
      {hearts.map(h => (
        <motion.div
          key={h.id}
          initial={{ y: '100vh', x: `${h.x}vw`, opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.15, 0] }}
          transition={{ duration: 8, ease: 'linear' }}
          style={{ position: 'absolute', fontSize: h.size }}
          className="pointer-events-none"
        >
          ❤️
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {unlocking ? (
          <motion.div
            key="unlocking"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 1, repeat: 1 }}
              className="inline-block mb-8"
            >
              <Heart className="w-24 h-24 text-accent fill-accent" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-romantic text-3xl text-accent"
            >
              Opening your surprise...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm text-center relative z-10"
          >
            {/* Time greeting */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 text-sm mb-6 tracking-widest uppercase"
            >
              {getTimeGreeting()}
            </motion.p>

            {/* Main icon */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(232,84,124,0.3)',
                  '0 0 60px rgba(232,84,124,0.5)',
                  '0 0 20px rgba(232,84,124,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-8 border border-accent/20"
            >
              <Heart className="w-12 h-12 fill-accent" />
            </motion.div>

            <h1 className="text-4xl font-heading font-black text-white mb-2">
              For Your Eyes Only
            </h1>
            <p className="text-white/30 mb-8 text-sm uppercase tracking-[0.3em] font-medium">
              Enter the secret token
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field text-center text-2xl tracking-[0.5em] py-4 pl-12 ${
                    error ? 'border-red-500 animate-shake' : ''
                  }`}
                  placeholder="••••"
                  required
                  autoFocus
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-accent w-full py-4 text-lg font-bold flex items-center justify-center gap-3"
              >
                <Unlock className="w-5 h-5" />
                Open the Vault
              </motion.button>
            </form>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-4"
              >
                Wrong password, try again 💔
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/15 text-xs mt-8"
            >
              ✨ This is something special, just for you
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EntryGate;
