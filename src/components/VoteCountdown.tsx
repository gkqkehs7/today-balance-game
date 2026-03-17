'use client';

import { useState, useEffect } from 'react';

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function VoteCountdown() {
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setTime(getTimeUntilMidnight());
    const interval = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <p className="vote-countdown">
      남은 투표 시간 {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
    </p>
  );
}
