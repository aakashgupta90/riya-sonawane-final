import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 50, delay = 0, className = '', onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setDone(true);
      if (onComplete) onComplete();
    }
  }, [displayedText, started, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!done && started && <span className="typewriter-cursor text-accent">|</span>}
    </span>
  );
};

export default Typewriter;
