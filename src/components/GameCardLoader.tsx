import { IQuestion } from '@/types';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';
import GameCard from '@/components/GameCard';

async function getTodayQuestion(): Promise<IQuestion | null> {
  try {
    await connectDB();
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    let question = await Question.findOne({ date: today }).lean();
    if (!question) {
      question = await Question.findOne({ date: { $lte: today } }).sort({ date: -1 }).lean();
    }
    if (!question) return null;
    return JSON.parse(JSON.stringify(question)) as IQuestion;
  } catch {
    return null;
  }
}

export default async function GameCardLoader() {
  const question = await getTodayQuestion();
  return <GameCard initialQuestion={question} />;
}
