import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';
import Vote from '@/models/Vote';

export async function GET() {
  try {
    await connectDB();
    const [questionCount, voteCount] = await Promise.all([
      Question.countDocuments(),
      Vote.countDocuments(),
    ]);
    return NextResponse.json({ questionCount, voteCount });
  } catch {
    return NextResponse.json({ questionCount: 0, voteCount: 0 });
  }
}
