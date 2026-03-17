import { IQuestion } from '@/types';
import WeatherCanvas from '@/components/WeatherCanvas';
import WeatherInfo from '@/components/WeatherInfo';
import GameCard from '@/components/GameCard';
import VoteCountdown from '@/components/VoteCountdown';
import AdminModal from '@/components/AdminModal';

async function getTodayQuestion(): Promise<IQuestion | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'}/api/questions/today`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const question = await getTodayQuestion();

  const now = new Date();
  const todayFormatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const questionNumber = question ? `#${question._id.slice(-4).toUpperCase()}` : '#--';

  return (
    <WeatherCanvas>
      <WeatherInfo />

      <div className="container">
        <header>
          <div className="date-line">
            <span>{todayFormatted}</span>
            <span className="dot">·</span>
            <span>{questionNumber}</span>
          </div>
          <h1>오늘의 밸런스 게임</h1>
          <p className="subtitle">지금 사람들은 어느 쪽일까요?</p>
          <VoteCountdown />
        </header>

        <GameCard initialQuestion={question} />
      </div>

      <AdminModal />
    </WeatherCanvas>
  );
}
