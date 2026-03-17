import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
  try {
    await connectDB();
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    // 오늘 날짜 질문 우선, 없으면 가장 최근 질문으로 폴백
    let question = await Question.findOne({ date: today }).lean();
    if (!question) {
      question = await Question.findOne({ date: { $lte: today } }).sort({ date: -1 }).lean();
    }
    if (!question) return NextResponse.json({ error: '등록된 문제가 없습니다.' }, { status: 404 });
    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
