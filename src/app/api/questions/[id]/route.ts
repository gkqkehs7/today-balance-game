import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAuth } from '@/lib/adminAuth';
import Question from '@/models/Question';
import Vote from '@/models/Vote';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const question = await Question.findById(id).lean();
    if (!question) return NextResponse.json({ error: '질문 없음' }, { status: 404 });

    const votes = await Vote.find({ questionId: id }).lean();
    const countA = votes.filter((v) => v.choice === 'A').length;
    const countB = votes.filter((v) => v.choice === 'B').length;
    const total = countA + countB;
    const percentA = total ? Math.round((countA / total) * 100) : 50;
    const percentB = total ? 100 - percentA : 50;

    return NextResponse.json({
      ...question,
      _id: String(question._id),
      votes: { countA, countB, total, percentA, percentB },
    });
  } catch (err) {
    console.error('[GET /api/questions/[id]]', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { question, optionA, optionB, date } = body;
    await connectDB();
    const updated = await Question.findByIdAndUpdate(
      id,
      { $set: { question, optionA, optionB, date } },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: `ID ${id} 를 찾을 수 없습니다.` }, { status: 404 });
    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error('PATCH error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();
    await Question.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
