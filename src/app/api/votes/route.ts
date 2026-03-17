import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vote from '@/models/Vote';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { questionId, choice } = await req.json();
    if (!questionId || !['A', 'B'].includes(choice))
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';

    await Vote.create({ questionId, ip, choice });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) return NextResponse.json({ error: '이미 투표했습니다.' }, { status: 409 });
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
