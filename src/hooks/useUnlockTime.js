import { useState, useEffect } from 'react';

// Target Time: April 23, 12:00 AM IST
// In ISO: 2026-04-22T18:30:00.000Z (which is 2026-04-23 00:00:00 IST)
const TARGET_DATE = new Date('2026-04-23T00:00:00+05:30');

// Compute initial unlock state synchronously to prevent flash-redirect
function getInitialUnlockState() {
  const now = new Date();
  const isAdmin = localStorage.getItem('admin_session') === 'active';
  return now >= TARGET_DATE || isAdmin;
}

export function useUnlockTime() {
  const [isUnlocked, setIsUnlocked] = useState(getInitialUnlockState);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const isAdmin = localStorage.getItem('admin_session') === 'active';
      
      if (now >= TARGET_DATE || isAdmin) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    };

    // Check every second (for live countdown transitions)
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return isUnlocked;
}

export { TARGET_DATE };
