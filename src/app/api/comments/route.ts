import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { questionId, choice, text } = await req.json();
    if (!questionId || !choice || !text?.trim())
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    const comment = await Comment.create({ questionId, choice, text: text.trim(), parentId: null });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
