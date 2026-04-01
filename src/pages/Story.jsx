import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, MessageCircleHeart, Sparkles, Lock, Unlock, ChevronRight, Eye } from 'lucide-react';
import FloatingHearts from '../components/FloatingHearts';

const Story = () => {
  const navigate = useNavigate();
  const [unlockedPhases, setUnlockedPhases] = useState([]);
  const [activePhase, setActivePhase] = useState(null);

  const timelineData = [
    {
      id: 'phase1',
      date: 'October 2021',
      emoji: '🌟',
      title: 'Our First Hello',
      shortTeaser: 'Where it all began...',
      description: 'The moment where it all began. A simple hello that turned into something so much more. It wasn\'t instant love — it was something more rare: an instant connection. Two strangers, one conversation, and a feeling that everything was about to change.',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500/20 to-purple-500/20',
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'phase2',
      date: 'The Connection',
      emoji: '💬',
      title: 'Finding Each Other',
      shortTeaser: 'Late nights, countless messages...',
      description: 'Late night talks that turned into early mornings. Countless messages that turned into our own language. The realization that we were two souls finding their reflection in each other. Every word brought us closer. Every silence was comfortable.',
      icon: <MessageCircleHeart className="w-6 h-6" />,
      color: 'from-pink-500/20 to-rose-500/20',
      image: "https://images.unsplash.com/photo-1516589174184-c68526614488?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'phase3',
      date: 'Growth',
      emoji: '🌺',
      title: 'Building Our World',
      shortTeaser: 'Through highs and lows...',
      description: 'Through the highs and the lows, we grew together. Every challenge made us stronger, and every celebration made our bond more beautiful. We built our own little world — full of inside jokes, shared silences, and a love that only we understand.',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-amber-500/20 to-orange-500/20',
      image: "https://images.unsplash.com/photo-1522673607200-164883eedeef?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'phase4',
      date: 'Today & Beyond',
      emoji: '❤️',
      title: 'Still You, Always You',
      shortTeaser: 'Stronger than ever...',
      description: 'Here we are today, stronger than ever. Looking back at our journey, I realize that every step was leading me to this moment — celebrating you. You came into my life and everything changed. And I wouldn\'t change a thing.',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500/20 to-pink-500/20',
      image: "https://images.unsplash.com/photo-1516641396056-0ce60a85d49f?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  const togglePhase = (id) => {
    if (unlockedPhases.includes(id)) {
      setActivePhase(activePhase === id ? null : id);
    } else {
      setUnlockedPhases(prev => [...prev, id]);
      setActivePhase(id);
      // Play click sound
      try {
        const audio = document.getElementById('clickSound');
        if (audio) { audio.currentTime = 0; audio.play(); }
      } catch (e) {}
    }
  };

  const allUnlocked = unlockedPhases.length === timelineData.length;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-0 relative">
      <FloatingHearts count={8} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-4">
            Our Beautiful <span className="text-accent">Story</span>
          </h1>
          <p className="font-romantic text-2xl text-accent/80 italic mb-4">
            A timeline of US
          </p>
          <p className="text-white/30 text-sm tracking-widest uppercase">
            🔒 Tap each memory to unlock it
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-white/10 to-accent/30 md:-translate-x-1/2" />

          {timelineData.map((item, index) => {
            const isUnlocked = unlockedPhases.includes(item.id);
            const isActive = activePhase === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`relative mb-16 last:mb-0 pl-16 md:pl-0 ${
                  index % 2 === 0 ? 'md:pr-[55%]' : 'md:pl-[55%]'
                }`}
              >
                {/* Connector dot */}
                <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full border-2 z-10 transition-all duration-500 ${
                  isUnlocked
                    ? 'border-accent bg-accent shadow-lg shadow-accent/50'
                    : 'border-white/20 bg-black'
                }`}>
                  {isUnlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 rounded-full bg-accent/40"
                    />
                  )}
                </div>

                {/* Card */}
                <motion.div
                  onClick={() => togglePhase(item.id)}
                  whileHover={{ scale: 1.02 }}
                  className={`relative cursor-pointer rounded-2xl border transition-all duration-500 overflow-hidden ${
                    isUnlocked
                      ? 'border-accent/30 bg-gradient-to-br ' + item.color
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  {/* Lock overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="w-8 h-8 text-white/40" />
                      </motion.div>
                      <p className="text-white/40 text-sm font-medium">Tap to unlock</p>
                      <p className="text-white/20 text-xs">{item.shortTeaser}</p>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Phase header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isUnlocked ? 'bg-accent text-white' : 'bg-white/10 text-white/40'
                      }`}>
                        {isUnlocked ? item.icon : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-accent font-medium tracking-widest text-xs uppercase block">
                          {item.date}
                        </span>
                        <span className="text-lg">{item.emoji}</span>
                      </div>
                      {isUnlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <Unlock className="w-4 h-4 text-accent/60" />
                        </motion.div>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>

                    {/* Revealed content */}
                    <AnimatePresence>
                      {isUnlocked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          <p className="text-white/60 leading-relaxed mb-6 italic">
                            {item.description}
                          </p>

                          {/* Image */}
                          <div className="relative overflow-hidden rounded-xl aspect-[16/10] group">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="flex justify-center gap-2 mb-4">
            {timelineData.map((item) => (
              <div
                key={item.id}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  unlockedPhases.includes(item.id) ? 'bg-accent scale-125' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-white/30 text-sm">
            {unlockedPhases.length} / {timelineData.length} memories unlocked
          </p>
        </motion.div>

        {/* Continue button */}
        <AnimatePresence>
          {allUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12"
            >
              <p className="font-romantic text-xl text-accent/60 italic mb-6">
                You unlocked all our memories 💖
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/chat-memories')}
                  className="btn-accent inline-flex items-center gap-2"
                >
                  <MessageCircleHeart className="w-5 h-5" />
                  Our Chat Memories
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/why-you')}
                  className="btn-accent inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 shadow-none"
                >
                  <Heart className="w-5 h-5" />
                  Why You're Special
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Story;
