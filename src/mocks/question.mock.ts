import { IQuestion } from '@/types';

export const MOCK_QUESTION: IQuestion = {
  _id: 'mock0001',
  question: '연봉 5천만원 워라밸 직장 vs 연봉 1억 야근 필수 직장',
  optionA: '내 공 가로채는 동료',
  optionB: '매일 야근시키는 상사',
  tag: '직장',
  date: new Date().toISOString().slice(0, 10),
  isAI: false,
  createdAt: new Date().toISOString(),
};
