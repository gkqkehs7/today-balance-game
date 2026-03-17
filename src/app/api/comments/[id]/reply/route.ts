import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: parentId } = await params;
    await connectDB();
    const { questionId, choice, text } = await req.json();
    if (!questionId || !choice || !text?.trim())
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });

    const parent = await Comment.findById(parentId);
    if (!parent) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    if (parent.parentId) return NextResponse.json({ error: '대댓글에는 답글을 달 수 없습니다.' }, { status: 400 });

    const reply = await Comment.create({ questionId, parentId, choice, text: text.trim() });
    return NextResponse.json(reply, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
