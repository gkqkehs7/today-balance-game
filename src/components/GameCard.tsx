'use client';

import { useState, useEffect } from 'react';
import { IQuestion, IVoteResult, IComment, VoteChoice, VoteState } from '@/types';
import { MOCK_QUESTION, MOCK_VOTES, MOCK_COMMENTS } from '@/lib/mockData';
import VoteButtons from '@/components/VoteButtons';
import ResultBar from '@/components/ResultBar';
import CommentSection from '@/components/CommentSection';
import ShareButton from '@/components/ShareButton';
import MockBanner from '@/components/MockBanner';
import StatsBar from '@/components/StatsBar';

interface GameCardProps {
  initialQuestion: IQuestion | null;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function GameCard({ initialQuestion }: GameCardProps) {
  const isMock = initialQuestion === null;
  const question: IQuestion = initialQuestion ?? MOCK_QUESTION;

  const [voteState, setVoteState] = useState<VoteState>('idle');
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null);
  const [myChoice, setMyChoice] = useState<VoteChoice | null>(null);
  const [voteResult, setVoteResult] = useState<IVoteResult | null>(null);

  useEffect(() => {
    const voteKey = isMock ? `vote_mock_${getTodayKey()}` : `vote_${getTodayKey()}`;
    const savedChoice = localStorage.getItem(voteKey) as VoteChoice | null;
    if (savedChoice) {
      setMyChoice(savedChoice);
      showResult(savedChoice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function showResult(choice: VoteChoice) {
    try {
      const data: IVoteResult = isMock
        ? { ...MOCK_VOTES }
        : await fetch(`/api/votes/${question._id}`).then(r => r.json());

      setMyChoice(choice);
      setVoteResult(data);
      setVoteState('confirmed');
    } catch (err) {
      console.error(err);
    }
  }

  function selectChoice(choice: VoteChoice) {
    const voteKey = isMock ? `vote_mock_${getTodayKey()}` : `vote_${getTodayKey()}`;
    if (localStorage.getItem(voteKey)) return;
    setPendingChoice(choice);
    setVoteState('pending');
  }

  async function confirmVote() {
    if (!pendingChoice) return;
    const choice = pendingChoice;
    setPendingChoice(null);
    setVoteState('loading');

    const voteKey = isMock ? `vote_mock_${getTodayKey()}` : `vote_${getTodayKey()}`;

    if (isMock) {
      localStorage.setItem(voteKey, choice);
      await showResult(choice);
      return;
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question._id, choice }),
      });

      if (res.status === 409) {
        localStorage.setItem(voteKey, choice);
      } else if (!res.ok) {
        const data = await res.json();
        alert(data.error || '투표 실패');
        setPendingChoice(choice);
        setVoteState('pending');
        return;
      } else {
        localStorage.setItem(voteKey, choice);
      }

      const resultRes = await fetch(`/api/votes/${question._id}`);
      const resultData: IVoteResult = await resultRes.json();
      setMyChoice(choice);
      setVoteResult(resultData);
      setVoteState('confirmed');
    } catch {
      alert('서버 오류');
      setPendingChoice(choice);
      setVoteState('pending');
    }
  }

  if (voteState === 'loading') {
    return (
      <div className="vote-loading-overlay">
        <div className="vote-loading-spinner" />
        <p>집계 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="card" id="game-card">
        <div className="question-area">
          <p className="question-text">{question.question}</p>
        </div>

        <VoteButtons
          optionA={question.optionA}
          optionB={question.optionB}
          voteState={voteState}
          pendingChoice={pendingChoice}
          myChoice={myChoice}
          onSelect={selectChoice}
          onConfirm={confirmVote}
        />

        {voteState === 'confirmed' && voteResult && (
          <ResultBar
            optionA={question.optionA}
            optionB={question.optionB}
            percentA={voteResult.percentA}
            percentB={voteResult.percentB}
            countA={voteResult.countA}
            countB={voteResult.countB}
            total={voteResult.total}
          />
        )}
      </div>

      <StatsBar />

      {voteState === 'confirmed' && (
        <ShareButton />
      )}

      {voteState === 'confirmed' && myChoice && (
        <CommentSection
          questionId={question._id}
          myChoice={myChoice}
          optionA={question.optionA}
          optionB={question.optionB}
          isMock={isMock}
        />
      )}

      <MockBanner isMock={isMock} />
    </>
  );
}
