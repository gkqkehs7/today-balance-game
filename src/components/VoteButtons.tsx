'use client';

import { VoteChoice, VoteState } from '@/types';

interface VoteButtonsProps {
  optionA: string;
  optionB: string;
  voteState: VoteState;
  pendingChoice: VoteChoice | null;
  myChoice: VoteChoice | null;
  percentA?: number;
  percentB?: number;
  countA?: number;
  countB?: number;
  onSelect: (choice: VoteChoice) => void;
  onConfirm: () => void;
}

export default function VoteButtons({
  optionA,
  optionB,
  voteState,
  pendingChoice,
  myChoice,
  percentA,
  percentB,
  countA,
  countB,
  onSelect,
  onConfirm,
}: VoteButtonsProps) {
  function getBtnClassA(): string {
    const base = 'vote-btn side-a';
    if (voteState === 'pending') {
      if (pendingChoice === 'A') return `${base} selected`;
      if (pendingChoice === 'B') return `${base} dimmed`;
    }
    if (voteState === 'confirmed') {
      if (myChoice === 'A') return `${base} chosen`;
      return `${base} not-chosen`;
    }
    return base;
  }

  function getBtnClassB(): string {
    const base = 'vote-btn side-b';
    if (voteState === 'pending') {
      if (pendingChoice === 'B') return `${base} selected`;
      if (pendingChoice === 'A') return `${base} dimmed`;
    }
    if (voteState === 'confirmed') {
      if (myChoice === 'B') return `${base} chosen`;
      return `${base} not-chosen`;
    }
    return base;
  }

  const isDisabled = voteState === 'confirmed';

  return (
    <div>
      <div className="vote-area">
        <div className="vote-col">
          <button
            className={getBtnClassA()}
            onClick={() => onSelect('A')}
            disabled={isDisabled}
          >
            <span className="vote-option">{optionA}</span>
          </button>
          {voteState === 'confirmed' && (
            <div className="result-chip chip-a">
              {myChoice === 'A' && <span className="my-team-badge team-a">내 선택</span>}
              {percentA !== undefined && <span className="result-stat stat-a">{percentA}% · {countA?.toLocaleString()}표</span>}
            </div>
          )}
        </div>

        <span className="vs-divider">VS</span>

        <div className="vote-col">
          <button
            className={getBtnClassB()}
            onClick={() => onSelect('B')}
            disabled={isDisabled}
          >
            <span className="vote-option">{optionB}</span>
          </button>
          {voteState === 'confirmed' && (
            <div className="result-chip chip-b">
              {myChoice === 'B' && <span className="my-team-badge team-b">내 선택</span>}
              {percentB !== undefined && <span className="result-stat stat-b">{percentB}% · {countB?.toLocaleString()}표</span>}
            </div>
          )}
        </div>
      </div>

      {voteState === 'pending' && pendingChoice && (
        <button
          key={pendingChoice}
          className={`vote-confirm-btn ${pendingChoice === 'A' ? 'confirm-a' : 'confirm-b'}`}
          onClick={onConfirm}
        >
          투표하기!
        </button>
      )}
    </div>
  );
}
