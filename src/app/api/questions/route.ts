import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAuth } from '@/lib/adminAuth';
import Question from '@/models/Question';

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  try {
    await connectDB();
    const { question, optionA, optionB, tag, date } = await req.json();
    if (!question || !optionA || !optionB || !date)
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    const q = await Question.create({ question, optionA, optionB, tag: tag || '일상', date });
    return NextResponse.json(q, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
