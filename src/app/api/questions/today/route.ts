import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
  try {
    await connectDB();
    const today = new Date().toISOString().slice(0, 10);
    const question = await Question.findOne({ date: today }).lean();
    if (!question) return NextResponse.json({ error: '오늘의 문제가 없습니다.' }, { status: 404 });
    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
