import React, { useMemo } from 'react';

const FloatingHearts = ({ count = 20 }) => {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 20,
      duration: 8 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: 0.03 + Math.random() * 0.08,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            left: `${h.left}%`,
            bottom: '-20px',
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animation: `floatUp ${h.duration}s linear ${h.delay}s infinite`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
