import { IQuestion, IVoteResult, IComment } from '@/types';

export const MOCK_QUESTION: IQuestion = {
  _id: 'mock0001',
  question: '연봉 5천만원 워라밸 직장 vs 연봉 1억 야근 필수 직장',
  optionA: '워라밸 5천',
  optionB: '억대연봉 야근',
  tag: '직장',
  date: new Date().toISOString().slice(0, 10),
  isAI: false,
  createdAt: new Date().toISOString(),
};

export const MOCK_VOTES: IVoteResult = {
  countA: 1284,
  countB: 876,
  total: 2160,
  percentA: 59,
  percentB: 41,
};

export const MOCK_COMMENTS: IComment[] = [
  {
    _id: 'c1',
    questionId: 'mock0001',
    parentId: null,
    choice: 'A',
    text: '돈이 많아도 쓸 시간이 없으면 의미가 없죠 ㅋㅋ',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      { _id: 'r1', questionId: 'mock0001', parentId: 'c1', choice: 'B', text: '근데 5천으로 서울에서 살 수 있나요...', createdAt: new Date(Date.now() - 3200000).toISOString(), replies: [] },
      { _id: 'r2', questionId: 'mock0001', parentId: 'c1', choice: 'A', text: '공감 100% 건강이 최고임', createdAt: new Date(Date.now() - 2800000).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c2',
    questionId: 'mock0001',
    parentId: null,
    choice: 'B',
    text: '야근해도 1억이면 몇 년만 버티고 퇴사각!',
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    replies: [
      { _id: 'r3', questionId: 'mock0001', parentId: 'c2', choice: 'A', text: '몇 년이 10년이 되는 거더라고요 ㅠ', createdAt: new Date(Date.now() - 2000000).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c3',
    questionId: 'mock0001',
    parentId: null,
    choice: 'A',
    text: '이미 야근 직장 다녀봤는데 진짜 삶이 없어요',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    replies: [],
  },
];
