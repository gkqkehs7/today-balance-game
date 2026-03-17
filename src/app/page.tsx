export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import WeatherCanvas from '@/components/WeatherCanvas';
import VoteCountdown from '@/components/VoteCountdown';
import GameCardLoader from '@/components/GameCardLoader';

function GameCardSkeleton() {
  return (
    <div className="card game-card-skeleton">
      <div className="vote-loading-spinner" />
      <p>오늘의 밸런스 게임 준비 중...</p>
    </div>
  );
}

export default function Home() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

  return (
    <WeatherCanvas>
      <div className="container">
        <header>
<h1>오늘의 밸런스 게임</h1>
          <p className="subtitle">당신의 선택은?</p>
          <VoteCountdown />
        </header>

        <Suspense fallback={<GameCardSkeleton />}>
          <GameCardLoader />
        </Suspense>
      </div>
    </WeatherCanvas>
  );
}
