import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
  try {
    await connectDB();
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const questions = await Question.find({ date: { $lt: today } }).sort({ date: -1 }).lean();
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
