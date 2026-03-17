import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { type, delta } = await req.json();
    if (!['like', 'dislike'].includes(type) || ![1, -1].includes(delta))
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });

    await connectDB();
    const field = type === 'like' ? 'likes' : 'dislikes';
    const comment = await Comment.findByIdAndUpdate(
      id,
      { $inc: { [field]: delta } },
      { new: true }
    ).lean();

    if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json({ likes: (comment as { likes: number }).likes, dislikes: (comment as { dislikes: number }).dislikes });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
