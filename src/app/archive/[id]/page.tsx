'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WeatherCanvas from '@/components/WeatherCanvas';
import ResultBar from '@/components/ResultBar';
import CommentSection from '@/components/CommentSection';
import { MOCK_ARCHIVE } from '@/mocks';

interface VoteResult {
  countA: number;
  countB: number;
  total: number;
  percentA: number;
  percentB: number;
}

interface QuestionDetail {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  tag: string;
  date: string;
  votes: VoteResult;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

export default function ArchiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // mock 데이터 먼저 확인
    const mockItem = MOCK_ARCHIVE.find(item => item._id === id);
    if (mockItem) {
      setData(mockItem as QuestionDetail);
      setIsMock(true);
      setLoading(false);
      return;
    }

    fetch(`/api/questions/${id}`)
      .then(r => {
        console.log('[archive detail] API status:', r.status, 'id:', id);
        return r.ok ? r.json() : r.json().then(e => Promise.reject(e));
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error('[archive detail] API error:', e); setLoading(false); });
  }, [id]);

  const winnerA = (data?.votes.percentA ?? 50) >= (data?.votes.percentB ?? 50);

  return (
    <WeatherCanvas>
      <div className="container">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <a href="/archive" style={{ fontSize: '1.1rem', opacity: 0.6, textDecoration: 'none', color: 'inherit' }}>←</a>
            <h1>{data ? `${formatDate(data.date)}의 밸런스 게임` : '밸런스 게임'}</h1>
          </div>
          <p className="subtitle" style={{ color: '#ff4d4d', fontWeight: 700, opacity: 1 }}>투표 종료</p>
        </header>

        {loading ? (
          <div className="card game-card-skeleton">
            <div className="vote-loading-spinner" />
          </div>
        ) : !data ? (
          <div className="card game-card-skeleton">게임을 찾을 수 없습니다.</div>
        ) : (
          <>
            <div className="card" id="game-card">
              <div className="question-area">
                <p className="question-text">{data.question}</p>
              </div>
              <div className="vote-area">
                <div className="vote-col" style={{ position: 'relative' }}>
                  {winnerA && <span className="archive-crown">👑</span>}
                  <button className={`vote-btn side-a ${winnerA ? 'chosen' : 'not-chosen'}`} disabled>
                    <span className="vote-option">{data.optionA}</span>
                  </button>
                </div>
                <span className="vs-divider">VS</span>
                <div className="vote-col" style={{ position: 'relative' }}>
                  {!winnerA && <span className="archive-crown">👑</span>}
                  <button className={`vote-btn side-b ${!winnerA ? 'chosen' : 'not-chosen'}`} disabled>
                    <span className="vote-option">{data.optionB}</span>
                  </button>
                </div>
              </div>
              <ResultBar
                optionA={data.optionA}
                optionB={data.optionB}
                percentA={data.votes.percentA}
                percentB={data.votes.percentB}
                countA={data.votes.countA}
                countB={data.votes.countB}
                total={data.votes.total}
              />
            </div>

            <CommentSection
              questionId={data._id}
              myChoice="A"
              optionA={data.optionA}
              optionB={data.optionB}
              isMock={isMock}
              readOnly={true}
            />
          </>
        )}
      </div>
    </WeatherCanvas>
  );
}
