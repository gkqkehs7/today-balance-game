import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const all = await Comment.find({ questionId: id }).sort({ createdAt: 1 }).lean();
    const roots = all.filter((c) => !c.parentId);
    const replies = all.filter((c) => c.parentId);
    const tree = roots.map((root) => ({
      ...root,
      replies: replies.filter((r) => String(r.parentId) === String(root._id)),
    }));
    return NextResponse.json(tree.reverse());
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
