import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnlockTime } from '../hooks/useUnlockTime';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isUnlocked = useUnlockTime();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter links based on unlock status
  const navLinks = [
    { name: 'Home', path: '/', show: true },
    { name: 'Story', path: '/story', show: isUnlocked },
    { name: '2021', path: '/year/2021', show: isUnlocked },
    { name: '2022', path: '/year/2022', show: isUnlocked },
    { name: '2023', path: '/year/2023', show: isUnlocked },
    { name: '2024', path: '/year/2024', show: isUnlocked },
    { name: '2025', path: '/year/2025', show: isUnlocked },
    { name: 'Final ❤️', path: '/final', show: isUnlocked },
  ].filter(link => link.show);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      scrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10 h-16" : "bg-transparent h-20"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-accent fill-accent animate-pulse" />
          <span className="font-romantic text-2xl text-white group-hover:text-accent transition-colors">Hunny</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "text-sm font-medium transition-all duration-300 hover:text-accent",
                isActive ? "text-accent" : "text-white/70"
              )}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-accent transition-colors p-2"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col py-4 px-6 gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => cn(
                    "text-lg font-medium transition-colors",
                    isActive ? "text-accent" : "text-white/70"
                  )}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
