import { IQuestion, IVoteResult, IComment } from '@/types';

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

export const MOCK_VOTES: IVoteResult = {
  countA: 1284,
  countB: 876,
  total: 2160,
  percentA: 59,
  percentB: 41,
};

const now = Date.now();
const m = (min: number) => now - min * 60000;

export const MOCK_COMMENTS: IComment[] = [
  {
    _id: 'c1', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '돈이 많아도 쓸 시간이 없으면 의미가 없죠 ㅋㅋ',
    likes: 12, dislikes: 1, createdAt: new Date(m(360)).toISOString(),
    replies: [
      { _id: 'r1', questionId: 'mock0001', parentId: 'c1', choice: 'B', text: '근데 5천으로 서울에서 살 수 있나요...', likes: 0, dislikes: 0, createdAt: new Date(m(340)).toISOString(), replies: [] },
      { _id: 'r2', questionId: 'mock0001', parentId: 'c1', choice: 'A', text: '공감 100% 건강이 최고임', likes: 0, dislikes: 0, createdAt: new Date(m(320)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c2', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근해도 1억이면 몇 년만 버티고 퇴사각!',
    likes: 7, dislikes: 3, createdAt: new Date(m(340)).toISOString(),
    replies: [
      { _id: 'r3', questionId: 'mock0001', parentId: 'c2', choice: 'A', text: '몇 년이 10년이 되는 거더라고요 ㅠ', likes: 0, dislikes: 0, createdAt: new Date(m(330)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c3', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '이미 야근 직장 다녀봤는데 진짜 삶이 없어요',
    likes: 3, dislikes: 0, createdAt: new Date(m(320)).toISOString(), replies: [],
  },
  {
    _id: 'c4', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '20대에 돈 모아놓으면 30대에 편하게 살 수 있음',
    likes: 5, dislikes: 2, createdAt: new Date(m(300)).toISOString(),
    replies: [
      { _id: 'r4', questionId: 'mock0001', parentId: 'c4', choice: 'A', text: '20대에 건강 망가지면 30대에 병원비로 다 날림', likes: 0, dislikes: 0, createdAt: new Date(m(290)).toISOString(), replies: [] },
      { _id: 'r5', questionId: 'mock0001', parentId: 'c4', choice: 'B', text: '그래도 돈은 있어야죠...', likes: 0, dislikes: 0, createdAt: new Date(m(280)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c5', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '공 가로채는 동료랑 일하면 번아웃 바로 옴',
    likes: 8, dislikes: 0, createdAt: new Date(m(280)).toISOString(), replies: [],
  },
  {
    _id: 'c6', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '매일 야근이면 그냥 집이 회사인 거 아닌가요 ㅠㅠ',
    likes: 4, dislikes: 1, createdAt: new Date(m(260)).toISOString(),
    replies: [
      { _id: 'r6', questionId: 'mock0001', parentId: 'c6', choice: 'B', text: '퇴근이 없는 삶... 상상도 하기 싫다', likes: 0, dislikes: 0, createdAt: new Date(m(250)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c7', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '동료가 내 공을 가로채면 성장도 없고 인정도 없고 다닐 이유가 없음',
    likes: 6, dislikes: 0, createdAt: new Date(m(240)).toISOString(), replies: [],
  },
  {
    _id: 'c8', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '1억이면 야근 참겠는데... 현실은 야근해도 연봉 4천이라 더 슬픔',
    likes: 15, dislikes: 2, createdAt: new Date(m(220)).toISOString(),
    replies: [
      { _id: 'r7', questionId: 'mock0001', parentId: 'c8', choice: 'A', text: 'ㅋㅋㅋ 현실 직격탄', likes: 0, dislikes: 0, createdAt: new Date(m(210)).toISOString(), replies: [] },
      { _id: 'r8', questionId: 'mock0001', parentId: 'c8', choice: 'B', text: '저도요... 야근에 연봉은 적고', likes: 0, dislikes: 0, createdAt: new Date(m(200)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c9', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '워라밸이 있어야 취미도 생기고 운동도 하고 사람도 만나죠',
    likes: 2, dislikes: 0, createdAt: new Date(m(200)).toISOString(), replies: [],
  },
  {
    _id: 'c10', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '솔직히 젊을 때 돈 버는 게 맞다고 생각해요. 나이 들면 체력도 없음',
    likes: 3, dislikes: 4, createdAt: new Date(m(190)).toISOString(),
    replies: [
      { _id: 'r9', questionId: 'mock0001', parentId: 'c10', choice: 'A', text: '젊을 때 건강 잃으면 나중에 더 힘들어요', likes: 0, dislikes: 0, createdAt: new Date(m(185)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c11', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '공 가로채는 동료 옆에서 일하면 내가 성장하는 건지 모르겠음',
    likes: 1, dislikes: 0, createdAt: new Date(m(180)).toISOString(), replies: [],
  },
  {
    _id: 'c12', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근 상사는 피하면 되는데 연봉 1억은 어디서 피해요 ㅋㅋ',
    likes: 9, dislikes: 1, createdAt: new Date(m(170)).toISOString(), replies: [],
  },
  {
    _id: 'c13', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '퇴근하고 나서 내 시간이 있어야 사람답게 사는 거지',
    likes: 5, dislikes: 0, createdAt: new Date(m(160)).toISOString(),
    replies: [
      { _id: 'r10', questionId: 'mock0001', parentId: 'c13', choice: 'B', text: '근데 퇴근 후에 돈 없으면 뭘 하나요ㅠ', likes: 0, dislikes: 0, createdAt: new Date(m(155)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c14', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '어차피 회사는 날 가족처럼 안 봐줌. 나도 돈만 보고 다님',
    likes: 11, dislikes: 3, createdAt: new Date(m(150)).toISOString(), replies: [],
  },
  {
    _id: 'c15', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '야근 강요는 그냥 내 삶을 뺏는 거임. 협상 불가',
    likes: 7, dislikes: 1, createdAt: new Date(m(145)).toISOString(), replies: [],
  },
  {
    _id: 'c16', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '5천으로 대출 갚으면서 살기 빠듯하지 않나요? 현실적으로',
    likes: 6, dislikes: 2, createdAt: new Date(m(140)).toISOString(),
    replies: [
      { _id: 'r11', questionId: 'mock0001', parentId: 'c16', choice: 'A', text: '지방 살면 5천도 꽤 여유로움', likes: 0, dislikes: 0, createdAt: new Date(m(135)).toISOString(), replies: [] },
      { _id: 'r12', questionId: 'mock0001', parentId: 'c16', choice: 'B', text: '서울은 진짜 힘들긴 함...', likes: 0, dislikes: 0, createdAt: new Date(m(130)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c17', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '저 공 가로채는 동료 있었는데 결국 그 팀 전체 분위기 망함',
    likes: 4, dislikes: 0, createdAt: new Date(m(125)).toISOString(), replies: [],
  },
  {
    _id: 'c18', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '1억 받으면서 야근하면 시급 계산해보면 생각보다 안 남음ㅋㅋ',
    likes: 13, dislikes: 0, createdAt: new Date(m(120)).toISOString(),
    replies: [
      { _id: 'r13', questionId: 'mock0001', parentId: 'c18', choice: 'B', text: '그래도 1억이잖아요... 저는 선택할게요', likes: 0, dislikes: 0, createdAt: new Date(m(115)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c19', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '심리적 안정이 중요하지 돈만 많아서 뭐함',
    likes: 2, dislikes: 1, createdAt: new Date(m(110)).toISOString(), replies: [],
  },
  {
    _id: 'c20', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근을 매일 하면 평일엔 회사, 주말엔 회복만 하다 끝남',
    likes: 8, dislikes: 0, createdAt: new Date(m(105)).toISOString(), replies: [],
  },
  {
    _id: 'c21', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '공 가로채는 동료 때문에 좋은 기회 다 날린 경험 있음. 트라우마',
    likes: 5, dislikes: 0, createdAt: new Date(m(100)).toISOString(), replies: [],
  },
  {
    _id: 'c22', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근이 문제가 아니라 야근을 강요하는 문화가 문제임',
    likes: 10, dislikes: 1, createdAt: new Date(m(95)).toISOString(),
    replies: [
      { _id: 'r14', questionId: 'mock0001', parentId: 'c22', choice: 'A', text: '공감. 자발적 야근이면 상관없는데', likes: 0, dislikes: 0, createdAt: new Date(m(90)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c23', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '5천이어도 칼퇴하고 운동하고 친구 만나면 삶의 질이 훨씬 높음',
    likes: 3, dislikes: 0, createdAt: new Date(m(88)).toISOString(), replies: [],
  },
  {
    _id: 'c24', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '돈이 있어야 결혼도 하고 집도 사고... 현실이 이렇잖아요',
    likes: 6, dislikes: 2, createdAt: new Date(m(85)).toISOString(), replies: [],
  },
  {
    _id: 'c25', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '공 가로채는 동료 = 신뢰 파괴. 이건 돈으로 못 버팀',
    likes: 4, dislikes: 0, createdAt: new Date(m(80)).toISOString(), replies: [],
  },
  {
    _id: 'c26', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '30대 되면 야근 체력도 안 됨. 20대에 벌어두자',
    likes: 2, dislikes: 3, createdAt: new Date(m(75)).toISOString(), replies: [],
  },
  {
    _id: 'c27', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '직장은 내 이력서를 위한 곳이지 내 청춘 바치는 곳이 아님',
    likes: 7, dislikes: 0, createdAt: new Date(m(70)).toISOString(),
    replies: [
      { _id: 'r15', questionId: 'mock0001', parentId: 'c27', choice: 'B', text: '근데 이력서에 연봉 안 적히잖아요 ㅋㅋ', likes: 0, dislikes: 0, createdAt: new Date(m(65)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c28', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '솔직히 야근 수당 제대로 주면 야근도 나쁘지 않음',
    likes: 5, dislikes: 1, createdAt: new Date(m(63)).toISOString(), replies: [],
  },
  {
    _id: 'c29', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '주변에 공 가로채는 사람 많으면 팀 자체가 썩음. 냄새남',
    likes: 3, dislikes: 0, createdAt: new Date(m(60)).toISOString(), replies: [],
  },
  {
    _id: 'c30', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근 후 택시 타고 집 가면서 우는 거 공감하시는 분?',
    likes: 16, dislikes: 0, createdAt: new Date(m(55)).toISOString(),
    replies: [
      { _id: 'r16', questionId: 'mock0001', parentId: 'c30', choice: 'B', text: '저 어제 그랬어요...', likes: 0, dislikes: 0, createdAt: new Date(m(50)).toISOString(), replies: [] },
      { _id: 'r17', questionId: 'mock0001', parentId: 'c30', choice: 'A', text: '이 댓글 보고 A 선택 확정ㅠ', likes: 0, dislikes: 0, createdAt: new Date(m(48)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c31', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '칼퇴하고 저녁에 책 읽고 산책하는 삶이 꿈임',
    likes: 4, dislikes: 0, createdAt: new Date(m(47)).toISOString(), replies: [],
  },
  {
    _id: 'c32', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '1억이면 5년 모아서 파이어족 도전 가능하지 않나요',
    likes: 8, dislikes: 4, createdAt: new Date(m(45)).toISOString(),
    replies: [
      { _id: 'r18', questionId: 'mock0001', parentId: 'c32', choice: 'A', text: '세금 떼면 7천이고 야근에 지쳐서 쓸 곳만 늘어남', likes: 0, dislikes: 0, createdAt: new Date(m(43)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c33', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '제 공 가로채던 동료 지금 팀장 됐어요. 세상이 이래요',
    likes: 14, dislikes: 1, createdAt: new Date(m(40)).toISOString(), replies: [],
  },
  {
    _id: 'c34', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근 = 비효율의 증거라고 생각하는데 그걸 강요하는 상사가 문제',
    likes: 6, dislikes: 0, createdAt: new Date(m(37)).toISOString(), replies: [],
  },
  {
    _id: 'c35', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '인간관계에서 신뢰가 깨지면 아무것도 못함. A 선택',
    likes: 2, dislikes: 0, createdAt: new Date(m(35)).toISOString(), replies: [],
  },
  {
    _id: 'c36', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근해도 주말에 쉬면 되지 않나요? 요즘 주 5일인데',
    likes: 1, dislikes: 5, createdAt: new Date(m(32)).toISOString(),
    replies: [
      { _id: 'r19', questionId: 'mock0001', parentId: 'c36', choice: 'B', text: '매일 야근이면 주말도 회복하다 끝남...', likes: 0, dislikes: 0, createdAt: new Date(m(30)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c37', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '정시 퇴근하고 자기 계발하면 오히려 더 빨리 성장함',
    likes: 5, dislikes: 1, createdAt: new Date(m(28)).toISOString(), replies: [],
  },
  {
    _id: 'c38', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '1억 받는 곳은 어딘지 알려주세요 진심으로',
    likes: 20, dislikes: 0, createdAt: new Date(m(25)).toISOString(),
    replies: [
      { _id: 'r20', questionId: 'mock0001', parentId: 'c38', choice: 'B', text: 'ㅋㅋㅋㅋ 저도요', likes: 0, dislikes: 0, createdAt: new Date(m(23)).toISOString(), replies: [] },
      { _id: 'r21', questionId: 'mock0001', parentId: 'c38', choice: 'A', text: '있어도 야근 필수면 안 감ㅋ', likes: 0, dislikes: 0, createdAt: new Date(m(21)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c39', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '동료를 믿을 수 없는 환경에서 일하는 게 제일 스트레스임',
    likes: 3, dislikes: 0, createdAt: new Date(m(20)).toISOString(), replies: [],
  },
  {
    _id: 'c40', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근이 싫어서 워라밸 직장 갔다가 돈이 없어서 더 스트레스받음 ㅠ',
    likes: 9, dislikes: 2, createdAt: new Date(m(18)).toISOString(), replies: [],
  },
  {
    _id: 'c41', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '칼퇴 = 자유 = 행복. 공식임',
    likes: 4, dislikes: 0, createdAt: new Date(m(16)).toISOString(), replies: [],
  },
  {
    _id: 'c42', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '2년만 버티면 퇴직금에 모은 돈으로 쉴 수 있음. 단기 전략',
    likes: 5, dislikes: 3, createdAt: new Date(m(14)).toISOString(),
    replies: [
      { _id: 'r22', questionId: 'mock0001', parentId: 'c42', choice: 'A', text: '2년이 어떻게 지나가는지 알아요...ㅠ', likes: 0, dislikes: 0, createdAt: new Date(m(12)).toISOString(), replies: [] },
    ],
  },
  {
    _id: 'c43', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '내가 한 일을 인정받지 못하면 의욕 자체가 사라짐',
    likes: 6, dislikes: 0, createdAt: new Date(m(11)).toISOString(), replies: [],
  },
  {
    _id: 'c44', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근 문화 있는 회사는 결국 번아웃으로 퇴사자 늘고 악순환됨',
    likes: 7, dislikes: 0, createdAt: new Date(m(9)).toISOString(), replies: [],
  },
  {
    _id: 'c45', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '저 A 선택했는데 같이 선택한 사람들 파이팅입니다',
    likes: 3, dislikes: 0, createdAt: new Date(m(7)).toISOString(), replies: [],
  },
  {
    _id: 'c46', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '고민했는데 결국 돈 선택. 현실은 냉정하더라고요',
    likes: 4, dislikes: 1, createdAt: new Date(m(6)).toISOString(), replies: [],
  },
  {
    _id: 'c47', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '공 가로채는 동료는 결국 자기 무덤 파는 거임. 기다리면 됨',
    likes: 8, dislikes: 0, createdAt: new Date(m(4)).toISOString(), replies: [],
  },
  {
    _id: 'c48', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '야근 많으면 집 살 돈 빨리 모음. 이게 현실 재테크',
    likes: 2, dislikes: 4, createdAt: new Date(m(3)).toISOString(), replies: [],
  },
  {
    _id: 'c49', questionId: 'mock0001', parentId: null, choice: 'A',
    text: '직장 동료는 내 편이어야 하는데 적이면 회사 가기 싫어짐',
    likes: 5, dislikes: 0, createdAt: new Date(m(2)).toISOString(), replies: [],
  },
  {
    _id: 'c50', questionId: 'mock0001', parentId: null, choice: 'B',
    text: '다들 고민 많으시겠지만 저는 그냥 복권 당첨되면 해결될 것 같아요 ㅋㅋ',
    likes: 18, dislikes: 0, createdAt: new Date(m(1)).toISOString(), replies: [
      { _id: 'r23', questionId: 'mock0001', parentId: 'c50', choice: 'A', text: '이게 정답이네요 ㅋㅋㅋ', likes: 0, dislikes: 0, createdAt: new Date(m(0)).toISOString(), replies: [] },
    ],
  },
];
