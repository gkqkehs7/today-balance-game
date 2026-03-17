export const dynamic = 'force-dynamic';

import { IQuestion } from '@/types';
import WeatherCanvas from '@/components/WeatherCanvas';
import WeatherInfo from '@/components/WeatherInfo';
import GameCard from '@/components/GameCard';
import VoteCountdown from '@/components/VoteCountdown';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';

async function getTodayQuestion(): Promise<IQuestion | null> {
  try {
    await connectDB();
    const today = new Date().toISOString().slice(0, 10);
    let question = await Question.findOne({ date: today }).lean();
    if (!question) {
      question = await Question.findOne({ date: { $lte: today } }).sort({ date: -1 }).lean();
    }
    if (!question) return null;
    // ObjectId → string 직렬화
    return JSON.parse(JSON.stringify(question)) as IQuestion;
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

    </WeatherCanvas>
  );
}
