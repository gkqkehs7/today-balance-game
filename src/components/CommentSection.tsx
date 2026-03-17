'use client';

import { useState, useEffect } from 'react';
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

export default function CommentSection({
  questionId,
  myChoice,
  optionA,
  optionB,
  isMock,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  async function loadComments() {
    try {
      if (isMock) {
        setComments(JSON.parse(JSON.stringify(MOCK_COMMENTS)));
        return;
      }
      const res = await fetch(`/api/comments/${questionId}`);
      if (!res.ok) return;
      const data: IComment[] = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
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
        createdAt: new Date().toISOString(),
        replies: [],
      };
      MOCK_COMMENTS.unshift(newComment);
      setCommentText('');
      await loadComments();
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
      await loadComments();
    } catch {
      alert('서버 오류');
    }
  }

  const badgeText = myChoice === 'A' ? optionA : optionB;
  const badgeClass = `my-team-badge ${myChoice === 'A' ? 'team-a' : 'team-b'}`;

  // Count total including replies
  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="comment-section">
      <h2 className="comment-title">
        댓글 <span className="comment-count">{totalCount > 0 ? totalCount : ''}</span>
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
        ) : comments.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        ) : (
          <>
            {comments.slice(0, visibleCount).map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                questionId={questionId}
                myChoice={myChoice}
                optionA={optionA}
                optionB={optionB}
                isMock={isMock}
                onReply={loadComments}
                formatTime={formatTime}
              />
            ))}
            {visibleCount < comments.length && (
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount(v => v + 5)}
              >
                댓글 더보기 ({comments.length - visibleCount}개 남음)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
