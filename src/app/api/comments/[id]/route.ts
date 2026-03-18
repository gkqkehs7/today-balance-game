import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '10'));
    const excludeId = searchParams.get('excludeId') ?? null;
    const skip = (page - 1) * limit;

    await connectDB();

    const filter: Record<string, unknown> = { questionId: id, parentId: null };
    if (excludeId) filter._id = { $ne: excludeId };

    const total = await Comment.countDocuments(filter);
    const roots = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const rootIds = roots.map(r => r._id);
    const replies = await Comment.find({ questionId: id, parentId: { $in: rootIds } })
      .sort({ createdAt: 1 })
      .lean();

    const tree = roots.map((root) => ({
      ...root,
      _id: String(root._id),
      replies: replies
        .filter((r) => String(r.parentId) === String(root._id))
        .map(r => ({ ...r, _id: String(r._id) })),
    }));

    return NextResponse.json({ comments: tree, hasMore: skip + limit < total, total });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
