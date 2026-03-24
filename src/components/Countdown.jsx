import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const Countdown = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const target = new Date(targetDate);
    
    if (now >= target) {
      if (onComplete) onComplete();
      return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
    }

    return {
      days: differenceInDays(target, now),
      hours: differenceInHours(target, now) % 24,
      minutes: differenceInMinutes(target, now) % 60,
      seconds: differenceInSeconds(target, now) % 60,
      finished: false
    };
  }, [targetDate, onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.finished) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="text-4xl md:text-6xl font-heading font-bold text-white mb-2 tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-sm uppercase tracking-widest text-white/40 font-medium">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-8 justify-center items-center py-8">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-2xl md:text-4xl font-heading text-white/20 mb-6">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl md:text-4xl font-heading text-white/20 mb-6">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="text-2xl md:text-4xl font-heading text-white/20 mb-6">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default Countdown;
