import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const roots = await Comment.find({ questionId: id, parentId: null }).lean();
    if (roots.length === 0) return NextResponse.json(null);

    const hot = roots.reduce<typeof roots[0] | null>((best, c) => {
      const score = (c.likes ?? 0) + (c.dislikes ?? 0);
      const bestScore = best ? (best.likes ?? 0) + (best.dislikes ?? 0) : 0;
      return score > 0 && score > bestScore ? c : best;
    }, null);

    if (!hot) return NextResponse.json(null);

    const replies = await Comment.find({ questionId: id, parentId: hot._id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ ...hot, _id: String(hot._id), replies });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
