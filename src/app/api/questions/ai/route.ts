import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAuth } from '@/lib/adminAuth';
import Question from '@/models/Question';

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  try {
    const { hint, date } = await req.json();
    if (!date) return NextResponse.json({ error: '날짜를 입력해주세요.' }, { status: 400 });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `한국어로 재미있는 밸런스 게임 질문 1개를 만들어줘.${hint ? ` 주제 힌트: ${hint}` : ''}
JSON 형식으로만 응답해: {"question": "전체 질문", "optionA": "선택지A", "optionB": "선택지B", "tag": "카테고리"}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 });

    const data = JSON.parse(jsonMatch[0]);
    await connectDB();
    const q = await Question.create({ ...data, date, isAI: true });
    return NextResponse.json(q, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
