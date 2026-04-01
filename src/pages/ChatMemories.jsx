import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Heart } from 'lucide-react';
import StarField from '../components/StarField';

const ChatMemories = () => {
  const navigate = useNavigate();
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  const chatMessages = [
    { sender: 'her', text: 'Hi 🙂', time: '10:32 PM' },
    { sender: 'me', text: 'Hey! Kaise ho?', time: '10:33 PM' },
    { sender: 'her', text: 'Main theek, tum batao', time: '10:33 PM' },
    { sender: 'me', text: 'Ab toh accha hai, tumse baat ho rahi hai 😄', time: '10:34 PM' },
    { sender: 'her', text: 'Haha smooth 😏', time: '10:35 PM' },
    { sender: 'me', text: 'Sach bol raha hoon yaar', time: '10:36 PM' },
    { sender: 'her', text: 'Chalo maan liya 🙈', time: '10:37 PM' },
    { sender: 'me', text: 'Acha suno…', time: '10:38 PM' },
    { sender: 'her', text: 'Haan bolo?', time: '10:38 PM' },
    { sender: 'me', text: 'Tum bahut special ho… pata hai?', time: '10:40 PM' },
    { sender: 'her', text: '🥺❤️', time: '10:41 PM' },
    { sender: 'me', text: 'I mean it. Sach me.', time: '10:42 PM' },
    { sender: 'me', text: 'And this website? This is my way of showing it 💖', time: '10:43 PM' },
    { sender: 'narrator', text: '— Some conversations change everything —' },
  ];

  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      setIsTyping(true);
      const delay = chatMessages[visibleMessages]?.sender === 'narrator' ? 1500 : 800 + Math.random() * 1200;
      const timer = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(prev => prev + 1);
        // Play soft sound
        try {
          const audio = document.getElementById('clickSound');
          if (audio) { audio.currentTime = 0; audio.volume = 0.2; audio.play(); }
        } catch (e) {}
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages, chatMessages.length]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  const allShown = visibleMessages >= chatMessages.length;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 relative">
      <StarField count={30} />

      <div className="max-w-lg mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-black text-white mb-2">
            Chat <span className="text-accent">Memories</span> 💬
          </h1>
          <p className="text-white/30 text-sm tracking-widest uppercase">
            Remember when it started?
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0b141a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
        >
          {/* Chat header bar */}
          <div className="bg-[#1f2c33] px-4 py-3 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent fill-accent" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Hunny ❤️</p>
              <p className="text-green-400 text-xs">online</p>
            </div>
          </div>

          {/* Chat messages */}
          <div
            ref={chatRef}
            className="p-4 space-y-3 max-h-[60vh] overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* Date header */}
            <div className="text-center mb-4">
              <span className="text-xs bg-[#1f2c33] text-white/40 px-3 py-1 rounded-lg inline-block">
                The Beginning ✨
              </span>
            </div>

            {chatMessages.slice(0, visibleMessages).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.sender === 'narrator' ? 'justify-center' :
                  msg.sender === 'me' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'narrator' ? (
                  <div className="text-center py-4">
                    <p className="text-white/30 text-sm italic font-romantic text-lg">
                      {msg.text}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] px-3 py-2 ${
                      msg.sender === 'me'
                        ? 'chat-bubble-sent'
                        : 'chat-bubble-received'
                    }`}
                  >
                    <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender === 'me' ? 'text-white/40 text-right' : 'text-white/30'
                    }`}>
                      {msg.time}
                      {msg.sender === 'me' && ' ✓✓'}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && visibleMessages < chatMessages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${
                    chatMessages[visibleMessages]?.sender === 'me' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`px-4 py-3 ${
                    chatMessages[visibleMessages]?.sender === 'me'
                      ? 'chat-bubble-sent'
                      : 'chat-bubble-received'
                  }`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Continue buttons */}
        <AnimatePresence>
          {allShown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8 space-y-4"
            >
              <p className="font-romantic text-xl text-accent/60 italic">
                Some chats are worth remembering forever 💖
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/why-you')}
                  className="btn-accent inline-flex items-center gap-2"
                >
                  Why You're Special
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/story')}
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Story
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatMemories;
