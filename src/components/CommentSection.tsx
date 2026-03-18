'use client';

import { useState, useEffect, useRef } from 'react';
import { IComment, VoteChoice } from '@/types';
import { MOCK_COMMENTS } from '@/lib/mockData';
import CommentItem from '@/components/CommentItem';

interface CommentSectionProps {
  questionId: string;
  myChoice: VoteChoice;
  optionA: string;
  optionB: string;
  isMock: boolean;
  initialComments?: IComment[];
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LIMIT = 10;

export default function CommentSection({
  questionId,
  myChoice,
  optionA,
  optionB,
  isMock,
}: CommentSectionProps) {
  const [hotComment, setHotComment] = useState<IComment | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hotIdRef = useRef<string | null>(null);

  function getMockHot(): IComment | null {
    const hot = MOCK_COMMENTS.reduce<IComment | null>((best, c) => {
      if (c.parentId) return best;
      const score = (c.likes ?? 0) + (c.dislikes ?? 0);
      const bestScore = best ? (best.likes ?? 0) + (best.dislikes ?? 0) : 0;
      return score > 0 && score > bestScore ? c : best;
    }, null);
    return hot;
  }

  async function loadHot() {
    if (isMock) {
      const hot = getMockHot();
      setHotComment(hot);
      hotIdRef.current = hot?._id ?? null;
      return hot?._id ?? null;
    }
    try {
      const res = await fetch(`/api/comments/${questionId}/hot`);
      if (!res.ok) return null;
      const data: IComment | null = await res.json();
      setHotComment(data);
      hotIdRef.current = data?._id ?? null;
      return data?._id ?? null;
    } catch {
      return null;
    }
  }

  async function loadPage(pageNum: number, excludeId: string | null, append = false) {
    if (isMock) {
      const roots = MOCK_COMMENTS.filter(c => !c.parentId && c._id !== excludeId);
      const slice = roots.slice((pageNum - 1) * LIMIT, pageNum * LIMIT);
      setComments(prev => append ? [...prev, ...slice] : slice);
      setHasMore(pageNum * LIMIT < roots.length);
      setTotalCount(roots.length + (excludeId ? 1 : 0));
      setPage(pageNum + 1);
      return;
    }
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(LIMIT) });
      if (excludeId) params.set('excludeId', excludeId);
      const res = await fetch(`/api/comments/${questionId}?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(prev => append ? [...prev, ...data.comments] : data.comments);
      setHasMore(data.hasMore);
      setTotalCount(data.total + (excludeId ? 1 : 0));
      setPage(pageNum + 1);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBoth(): Promise<void> {
    if (isMock) {
      const hot = getMockHot();
      const hotId = hot?._id ?? null;
      const roots = MOCK_COMMENTS.filter(c => !c.parentId && c._id !== hotId);
      setHotComment(hot);
      hotIdRef.current = hotId;
      setComments(roots.slice(0, LIMIT));
      setHasMore(LIMIT < roots.length);
      setTotalCount(roots.length + (hotId ? 1 : 0));
      setPage(2);
      return;
    }

    const [hotRes, commentsRes] = await Promise.all([
      fetch(`/api/comments/${questionId}/hot`),
      fetch(`/api/comments/${questionId}?page=1&limit=${LIMIT}`),
    ]);

    const hotData: IComment | null = hotRes.ok ? await hotRes.json() : null;
    const hotId = hotData?._id ?? null;
    const commentsData = commentsRes.ok
      ? await commentsRes.json()
      : { comments: [], hasMore: false, total: 0 };

    // hot 댓글이 목록에 포함되어 있으면 제거
    const filtered = commentsData.comments.filter((c: IComment) => c._id !== hotId);

    setHotComment(hotData);
    hotIdRef.current = hotId;
    setComments(filtered);
    setHasMore(commentsData.hasMore);
    setTotalCount(commentsData.total);
    setPage(2);
  }

  async function initialLoad() {
    setIsLoading(true);
    await fetchBoth();
    setIsLoading(false);
  }

  async function refreshComments() {
    setIsRefreshing(true);
    setPage(1);
    await fetchBoth();
    setIsRefreshing(false);
  }

  async function loadMore() {
    setIsLoadingMore(true);
    await loadPage(page, hotIdRef.current, true);
    setIsLoadingMore(false);
  }

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  async function submitComment() {
    const text = commentText.trim();
    if (!text) return;

    if (isMock) {
      const newComment: IComment = {
        _id: `c${Date.now()}`,
        questionId,
        parentId: null,
        choice: myChoice,
        text,
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      MOCK_COMMENTS.unshift(newComment);
      setCommentText('');
      await refreshComments();
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, choice: myChoice, text }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error);
        return;
      }
      setCommentText('');
      await refreshComments();
    } catch {
      alert('서버 오류');
    }
  }

  const badgeText = myChoice === 'A' ? optionA : optionB;
  const badgeClass = `my-team-badge ${myChoice === 'A' ? 'team-a' : 'team-b'}`;

  return (
    <div className="comment-section">
      <h2 className="comment-title">
        댓글 <span className="comment-count">{totalCount > 0 ? totalCount : ''}</span>
        <button
          className={`comment-refresh-btn${isRefreshing ? ' refreshing' : ''}`}
          onClick={refreshComments}
          disabled={isRefreshing}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </h2>

      <div className="comment-input-wrap">
        <span className={badgeClass}>{badgeText}</span>
        <input
          type="text"
          placeholder="의견을 남겨보세요 (최대 100자)"
          maxLength={100}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitComment(); }}
        />
        <button onClick={submitComment}>등록</button>
      </div>

      <div>
        {isLoading ? (
          <div className="sk-comment-list">
            {[0, 1, 2].map(i => (
              <div key={i} className="comment-item sk-comment-item">
                <div className="sk-comment-header">
                  <div className="sk sk-badge" />
                  <div className="sk sk-time" />
                </div>
                <div className="sk sk-comment-line1" />
                <div className="sk sk-comment-line2" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        ) : (
          <>
            {hotComment && (
              <CommentItem
                key={hotComment._id}
                comment={hotComment}
                questionId={questionId}
                myChoice={myChoice}
                optionA={optionA}
                optionB={optionB}
                isMock={isMock}
                pinned={true}
                onReply={refreshComments}
                formatTime={formatTime}
              />
            )}
            {comments.map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                questionId={questionId}
                myChoice={myChoice}
                optionA={optionA}
                optionB={optionB}
                isMock={isMock}
                pinned={false}
                onReply={refreshComments}
                formatTime={formatTime}
              />
            ))}
            {hasMore && (
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '불러오는 중...' : `댓글 더보기`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
