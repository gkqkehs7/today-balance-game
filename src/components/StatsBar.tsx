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
      <div className="stats-box">
        <span className="stats-label">지금까지 진행된 게임 수</span>
        <span className="stats-value">{stats.questionCount.toLocaleString()}회</span>
      </div>
      <div className="stats-box">
        <span className="stats-label">지금까지 투표 수</span>
        <span className="stats-value">{stats.voteCount.toLocaleString()}표</span>
      </div>
    </div>
  );
}
