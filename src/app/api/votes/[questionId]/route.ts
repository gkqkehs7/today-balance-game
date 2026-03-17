import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vote from '@/models/Vote';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const { questionId } = await params;
    await connectDB();
    const votes = await Vote.find({ questionId }).lean();
    const countA = votes.filter((v) => v.choice === 'A').length;
    const countB = votes.filter((v) => v.choice === 'B').length;
    const total = countA + countB;
    const percentA = total ? Math.round((countA / total) * 100) : 50;
    const percentB = total ? 100 - percentA : 50;
    return NextResponse.json({ countA, countB, total, percentA, percentB });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
