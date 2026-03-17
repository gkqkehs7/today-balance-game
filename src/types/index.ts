export interface IQuestion {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  tag: string;
  date: string;
  isAI: boolean;
  createdAt: string;
}

export interface IVoteResult {
  countA: number;
  countB: number;
  total: number;
  percentA: number;
  percentB: number;
}

export interface IComment {
  _id: string;
  questionId: string;
  parentId: string | null;
  choice: 'A' | 'B';
  text: string;
  createdAt: string;
  replies: IComment[];
}

export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'mist' | 'heat' | 'thunder';
export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';
export type VoteChoice = 'A' | 'B';
export type VoteState = 'idle' | 'pending' | 'loading' | 'confirmed';
