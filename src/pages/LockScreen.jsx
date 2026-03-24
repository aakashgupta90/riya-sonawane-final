import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart } from 'lucide-react';

const LockScreen = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default password for site access (can be same as admin for simplicity)
    const sitePassword = import.meta.env.VITE_ADMIN_PASSWORD || 'hunny2026';
    
    if (password === sitePassword) {
      localStorage.setItem('site_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center text-accent mx-auto mb-8 animate-pulse">
           <Heart className="w-10 h-10 fill-accent" />
        </div>
        
        <h1 className="text-3xl font-heading font-black text-white mb-2 italic">For Your Eyes Only</h1>
        <p className="text-white/40 mb-8 text-sm uppercase tracking-widest font-medium">Please enter the secret token</p>

        <form onSubmit={handleSubmit} className="space-y-4">
           <input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className={`input-field text-center text-2xl tracking-[0.5em] focus:ring-accent py-4 ${error ? 'border-red-500 animate-shake' : ''}`}
             placeholder="••••"
             required
           />
           <button type="submit" className="btn-accent w-full py-4 text-lg font-bold">
             Open the Vault
           </button>
        </form>
        
        <style jsx>{`
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default LockScreen;
