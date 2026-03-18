'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatsBar() {
  const [stats, setStats] = useState<{ questionCount: number; voteCount: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div
      className={`stats-bar ${hovered ? 'stats-bar-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push('/archive')}
    >
      {hovered ? (
        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.03em', padding: '4px 0' }}>
          역대 게임 결과 보기 →
        </div>
      ) : (
        <>
          <div className="stats-item">
            <span className="stats-value">{stats.questionCount.toLocaleString()}회</span>
            <span className="stats-label">진행된 게임 수</span>
          </div>
          <div className="stats-divider" />
          <div className="stats-item">
            <span className="stats-value">{stats.voteCount.toLocaleString()}표</span>
            <span className="stats-label">총 투표 수</span>
          </div>
        </>
      )}
    </div>
  );
}
