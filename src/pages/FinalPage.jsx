import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Star, Gift, Share2 } from 'lucide-react';
import { useCms } from '../hooks/useCms';

const FinalPage = () => {
  const [messagesRevealed, setMessagesRevealed] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const cms = useCms();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleConfetti();
      setShowConfetti(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleConfetti = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const extraMessages = [
    "You are my favorite distraction. ❤️",
    "I'm so lucky to have you in my life. ✨",
    "Every day is a celebration when I'm with you. 🌹",
    "I promise to always be there for you. 💍",
    "You're the person I want to annoy for the rest of my life. 😂❤️",
    "You make my world so much brighter. 🌟",
    "I love you more than words can say. 💞"
  ];

  const revealNextMessage = () => {
    if (messagesRevealed < extraMessages.length) {
      setMessagesRevealed(prev => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e8547c', '#ffffff', '#ff0000']
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-6 overflow-hidden">
      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        <motion.div
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1, type: "spring" }}
           className="relative inline-block"
        >
          <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full" />
          <Heart className="w-24 h-24 md:w-32 md:h-32 text-accent fill-accent shadow-2xl relative" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className="w-8 h-8 text-white/50" />
          </motion.div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.5 }}
           className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-heading font-black text-white leading-tight">
            Happy Birthday, <br/>
            <span className="text-accent underline decoration-white/10 decoration-wavy">Hunny ❤️</span>
          </h1>
          <p className="font-romantic text-2xl md:text-4xl text-white/80 max-w-3xl mx-auto italic leading-relaxed">
            "{cms.final_message_quote}"
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="space-y-8"
        >
          <div className="flex flex-wrap justify-center gap-4">
             {extraMessages.slice(0, messagesRevealed).map((msg, i) => (
                <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="glassCard py-3 px-6 text-white font-medium border-accent/20 bg-accent/5 backdrop-blur-md rounded-full shadow-lg shadow-accent/10"
                >
                   {msg}
                </motion.div>
             ))}
          </div>

          <button
            onClick={revealNextMessage}
            disabled={messagesRevealed >= extraMessages.length}
            className="btn-accent inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
             <Gift className="w-5 h-5 transition-transform group-hover:rotate-12" />
             <span className="relative z-10">
               {messagesRevealed === 0 ? "What are you to me?" : 
                messagesRevealed < extraMessages.length ? "Tell me more..." : 
                "That's all for now, my love ❤️"}
             </span>
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </motion.div>
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
