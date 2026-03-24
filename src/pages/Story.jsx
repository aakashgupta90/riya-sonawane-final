import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, MessageCircleHeart, Sparkles } from 'lucide-react';

const Story = () => {
  const timelineData = [
    {
      date: 'October 2021',
      title: 'Our First Hello',
      description: 'The moment where it all began. A simple hello that turned into something so much more. It wasn’t instant love, it was something more rare: an instant connection.',
      icon: <Calendar className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200", // Placeholder, admin will update
    },
    {
      date: 'The Connection',
      title: 'Finding Each Other',
      description: 'Late night talks, countless messages, and the realization that we were two souls finding their reflection in each other. Every word brought us closer.',
      icon: <MessageCircleHeart className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1516589174184-c68526614488?auto=format&fit=crop&q=80&w=1200",
    },
    {
      date: 'Growth',
      title: 'Building Our World',
      description: 'Through the highs and the lows, we grew together. Every challenge made us stronger, and every celebration made our bond more beautiful.',
      icon: <Sparkles className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1522673607200-164883eedeef?auto=format&fit=crop&q=80&w=1200",
    },
    {
      date: 'Present',
      title: 'Still You, Always You',
      description: 'Here we are today, stronger than ever. Looking back at our journey, I realize that every step was leading me to this moment—celebrating you.',
      icon: <Heart className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1516641396056-0ce60a85d49f?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-4">Our Beautiful <span className="text-accent">Story</span></h1>
          <p className="font-romantic text-2xl text-accent/80 italic">A timeline of US</p>
        </motion.div>

        <div className="relative">
          {/* Central Line Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          {timelineData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col md:flex-row items-center justify-between mb-24 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content Side */}
              <div className="w-full md:w-[45%] mb-8 md:mb-0">
                <div className="glassCard border-white/5 bg-white/[0.03] group hover:border-accent/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <span className="text-accent font-medium tracking-widest text-sm uppercase">{item.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">{item.title}</h2>
                  <p className="text-white/60 leading-relaxed mb-6 italic">{item.description}</p>
                </div>
              </div>

              {/* Connector Dot */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-white/10 bg-black items-center justify-center z-10">
                <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
              </div>

              {/* Image Side */}
              <div className="w-full md:w-[45%]">
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Story;
