'use client';

import { useEffect, useState } from 'react';

export default function StatsBar() {
  const [stats, setStats] = useState<{ questionCount: number; voteCount: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="stats-bar">
      <span>밸런스 게임 <strong>{stats.questionCount.toLocaleString()}</strong>회</span>
      <span className="stats-sep">|</span>
      <span>총 투표 <strong>{stats.voteCount.toLocaleString()}</strong>표</span>
    </div>
  );
}
