import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import FloatingHearts from '../components/FloatingHearts';

const WhyYou = () => {
  const navigate = useNavigate();
  const [currentReason, setCurrentReason] = useState(null);
  const [shownReasons, setShownReasons] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  const reasons = [
    { text: "Your smile lights up my entire world 😊", emoji: "😊" },
    { text: "The way you care about everyone around you 💕", emoji: "💕" },
    { text: "Your beautiful madness and random energy 🤪", emoji: "🤪" },
    { text: "How you make even boring moments fun 🎭", emoji: "🎭" },
    { text: "Your laugh — it's my favorite sound 🎵", emoji: "🎵" },
    { text: "The way you look when you're focused 🤓", emoji: "🤓" },
    { text: "Your kindness, even when no one's watching 🌹", emoji: "🌹" },
    { text: "How you always know what to say 💬", emoji: "💬" },
    { text: "Your strength — you're stronger than you think 💪", emoji: "💪" },
    { text: "The fact that you're reading this right now 🥺", emoji: "🥺" },
    { text: "Your stubbornness (yes, even that) 😤❤️", emoji: "😤" },
    { text: "How you make me want to be a better person ✨", emoji: "✨" },
    { text: "Your voice — I could listen to it forever 🎧", emoji: "🎧" },
    { text: "The way you scrunch your nose 🐰", emoji: "🐰" },
    { text: "Simply because… you are YOU 💖", emoji: "💖" },
  ];

  const getRandomReason = useCallback(() => {
    const available = reasons.filter(r => !shownReasons.includes(r.text));
    if (available.length === 0) {
      setShownReasons([]);
      return reasons[Math.floor(Math.random() * reasons.length)];
    }
    const random = available[Math.floor(Math.random() * available.length)];
    setShownReasons(prev => [...prev, random.text]);
    return random;
  }, [shownReasons]);

  const handleClick = () => {
    const reason = getRandomReason();
    setCurrentReason(reason);
    setClickCount(prev => prev + 1);

    // Confetti burst on every 3rd click
    if ((clickCount + 1) % 3 === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e8547c', '#ff69b4', '#ffffff'],
      });
    }

    try {
      const audio = document.getElementById('clickSound');
      if (audio) { audio.currentTime = 0; audio.volume = 0.15; audio.play(); }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 flex flex-col items-center justify-center relative">
      <FloatingHearts count={10} />

      <div className="max-w-xl mx-auto text-center relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="w-16 h-16 text-accent fill-accent mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-heading font-black text-white mb-3">
            Why <span className="text-accent">You're</span> Special?
          </h1>
          <p className="text-white/30 text-sm tracking-widest uppercase">
            Tap the button to find out ✨
          </p>
        </motion.div>

        {/* Reason display */}
        <div className="min-h-[200px] flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            {currentReason ? (
              <motion.div
                key={currentReason.text}
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="glassCard border-accent/20 bg-accent/5 max-w-md mx-auto"
              >
                <p className="text-5xl mb-4">{currentReason.emoji}</p>
                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed italic">
                  "{currentReason.text}"
                </p>
                <p className="text-white/20 text-xs mt-4">
                  Reason #{clickCount} of ∞
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/20 text-lg"
              >
                <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                <p>Click below to discover...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: 5 }}
          className="btn-accent text-lg px-10 py-4 inline-flex items-center gap-3 glow-pulse"
        >
          <RefreshCw className={`w-5 h-5 ${clickCount > 0 ? 'animate-spin-slow' : ''}`} />
          {clickCount === 0 ? "Why am I special?" : "Tell me more 💖"}
        </motion.button>

        {clickCount >= 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/20 text-xs mt-6"
          >
            You keep clicking... that's because you know you deserve every word 💖
          </motion.p>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/surprise')}
            className="btn-accent inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 shadow-none text-white/80"
          >
            Don't click this 😏
            <ChevronRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/final')}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white" />
            Final Surprise
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default WhyYou;
