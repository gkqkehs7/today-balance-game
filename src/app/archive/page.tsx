'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_ARCHIVE, ArchiveMockItem } from '@/mocks';
import ResultBar from '@/components/ResultBar';
import WeatherCanvas from '@/components/WeatherCanvas';

interface VoteResult {
  countA: number;
  countB: number;
  total: number;
  percentA: number;
  percentB: number;
}

interface ArchiveQuestion {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  tag: string;
  date: string;
  votes: VoteResult;
}

type ArchiveItem = ArchiveQuestion | ArchiveMockItem;

const LIMIT = 8;

function ArchiveCard({ item }: { item: ArchiveItem }) {
  const router = useRouter();
  const winnerA = item.votes.percentA >= item.votes.percentB;

  return (
    <div className="archive-card-wrap" onClick={() => router.push(`/archive/${item._id}`)}>
      <div className="card" style={{ marginTop: 0 }}>
        <div className="question-area">
          <p className="archive-date-label">{item.date}</p>
          <p className="question-text">{item.question}</p>
        </div>
        <div className="vote-area">
          <div className="vote-col" style={{ position: 'relative' }}>
            {winnerA && <span className="archive-crown">👑</span>}
            <button className={`vote-btn side-a ${winnerA ? 'chosen' : 'not-chosen'}`} disabled>
              <span className="vote-option">{item.optionA}</span>
            </button>
          </div>
          <span className="vs-divider">VS</span>
          <div className="vote-col" style={{ position: 'relative' }}>
            {!winnerA && <span className="archive-crown">👑</span>}
            <button className={`vote-btn side-b ${!winnerA ? 'chosen' : 'not-chosen'}`} disabled>
              <span className="vote-option">{item.optionB}</span>
            </button>
          </div>
        </div>
        <ResultBar
          optionA={item.optionA}
          optionB={item.optionB}
          percentA={item.votes.percentA}
          percentB={item.votes.percentB}
          countA={item.votes.countA}
          countB={item.votes.countB}
          total={item.votes.total}
        />
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (pageNum: number, useMock: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    if (useMock) {
      const start = (pageNum - 1) * LIMIT;
      const slice = MOCK_ARCHIVE.slice(start, start + LIMIT);
      setItems((prev) => [...prev, ...slice]);
      setHasMore(start + LIMIT < MOCK_ARCHIVE.length);
      setPage(pageNum + 1);
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    try {
      const res = await fetch(`/api/questions/archive-with-votes?page=${pageNum}&limit=${LIMIT}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(pageNum + 1);
    } catch {
      // API 실패 시 mock으로 fallback (첫 페이지만)
      if (pageNum === 1) {
        setIsMock(true);
        setItems(MOCK_ARCHIVE.slice(0, LIMIT));
        setHasMore(MOCK_ARCHIVE.length > LIMIT);
        setPage(2);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // 첫 로드
  useEffect(() => {
    loadPage(1, false).finally(() => setInitialLoading(false));
  }, [loadPage]);

  // IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadPage(page, isMock);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, isMock, loadPage]);

  return (
    <WeatherCanvas>
      <main className="archive-page">
        <div className="archive-header">
          <a href="/" className="archive-back">←</a>
          <h1 className="archive-title">역대 밸런스 게임</h1>
        </div>
        {initialLoading ? (
          <div className="archive-loading">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="archive-loading">아직 진행된 게임이 없습니다.</div>
        ) : (
          <>
            <div className="archive-list">
              {items.map((item) => (
                <ArchiveCard key={item._id} item={item} />
              ))}
            </div>
            <div ref={sentinelRef} style={{ height: 40 }} />
            {loading && <div className="archive-loading">불러오는 중...</div>}
          </>
        )}
      </main>
    </WeatherCanvas>
  );
}
