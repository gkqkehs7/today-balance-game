import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';
import Vote from '@/models/Vote';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '8'));
    const skip = (page - 1) * limit;

    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const total = await Question.countDocuments({ date: { $lte: today } });
    const questions = await Question.find({ date: { $lte: today } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = await Promise.all(
      questions.map(async (q) => {
        const votes = await Vote.find({ questionId: q._id }).lean();
        const countA = votes.filter((v) => v.choice === 'A').length;
        const countB = votes.filter((v) => v.choice === 'B').length;
        const total = countA + countB;
        const percentA = total ? Math.round((countA / total) * 100) : 50;
        const percentB = total ? 100 - percentA : 50;
        return { ...q, _id: String(q._id), votes: { countA, countB, total, percentA, percentB } };
      })
    );

    return NextResponse.json({ items, hasMore: skip + limit < total, total });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
