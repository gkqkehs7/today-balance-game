'use client';

import { useState, useEffect } from 'react';
import { IComment, VoteChoice } from '@/types';
import { MOCK_COMMENTS } from '@/lib/mockData';

interface CommentItemProps {
  comment: IComment;
  questionId: string;
  myChoice: VoteChoice;
  optionA: string;
  optionB: string;
  isMock: boolean;
  pinned?: boolean;
  readOnly?: boolean;
  onReply: () => void;
  formatTime: (iso: string) => string;
}

export default function CommentItem({
  comment,
  questionId,
  myChoice,
  optionA,
  optionB,
  isMock,
  pinned,
  readOnly = false,
  onReply,
  formatTime,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [visibleReplies, setVisibleReplies] = useState(3);
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [dislikes, setDislikes] = useState(comment.dislikes ?? 0);
  const [myReaction, setMyReaction] = useState<'like' | 'dislike' | null>(null);
  const [isMine, setIsMine] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`reaction_${comment._id}`);
    if (stored === 'like' || stored === 'dislike') setMyReaction(stored);
    setIsMine(!!localStorage.getItem(`my_comment_${comment._id}`));
  }, [comment._id]);

  const optionLabel = comment.choice === 'A' ? optionA : optionB;

  function toggleReply() {
    setShowReplyInput(prev => !prev);
    setReplyText('');
  }

  async function handleReaction(type: 'like' | 'dislike') {
    const isSame = myReaction === type;
    const delta = isSame ? -1 : 1;
    const newReaction = isSame ? null : type;

    // 반대 리액션 취소
    if (myReaction && myReaction !== type) {
      if (isMock) {
        if (myReaction === 'like') setLikes(l => l - 1);
        else setDislikes(d => d - 1);
      } else {
        await fetch(`/api/comments/${comment._id}/like`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: myReaction, delta: -1 }),
        });
        if (myReaction === 'like') setLikes(l => l - 1);
        else setDislikes(d => d - 1);
      }
    }

    if (isMock) {
      if (type === 'like') setLikes(l => l + delta);
      else setDislikes(d => d + delta);
    } else {
      const res = await fetch(`/api/comments/${comment._id}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, delta }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
      }
    }

    setMyReaction(newReaction);
    if (newReaction) localStorage.setItem(`reaction_${comment._id}`, newReaction);
    else localStorage.removeItem(`reaction_${comment._id}`);
  }

  async function submitReply() {
    const text = replyText.trim();
    if (!text) return;

    if (isMock) {
      const parent = MOCK_COMMENTS.find(c => c._id === comment._id);
      if (parent) {
        const newReply = {
          _id: `r${Date.now()}`,
          questionId,
          parentId: comment._id,
          choice: myChoice,
          text,
          likes: 0,
          dislikes: 0,
          createdAt: new Date().toISOString(),
          replies: [],
        };
        localStorage.setItem(`my_comment_${newReply._id}`, '1');
        parent.replies.push(newReply);
      }
      setShowReplyInput(false);
      setReplyText('');
      onReply();
      return;
    }

    try {
      const res = await fetch(`/api/comments/${comment._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, choice: myChoice, text }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error);
        return;
      }
      const created = await res.json();
      if (created?._id) localStorage.setItem(`my_comment_${created._id}`, '1');
      setShowReplyInput(false);
      setReplyText('');
      onReply();
    } catch {
      alert('서버 오류');
    }
  }

  const replyBadgeText = myChoice === 'A' ? optionA : optionB;
  const replyBadgeClass = `my-team-badge ${myChoice === 'A' ? 'team-a' : 'team-b'}`;

  return (
    <div
      className={`comment-item${pinned ? ' comment-pinned' : ''}`}
      style={pinned ? { position: 'relative', background: 'linear-gradient(135deg, #ff8c28, #dc4614)', border: 'none', overflow: 'visible' } : undefined}
    >
      {pinned && (
        <div style={{ position: 'absolute', top: '-30px', right: '-2px', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ fontSize: '4.5rem' }}>🔥</span>
        </div>
      )}
      <div className="comment-header">
        <span className={`choice-badge ${comment.choice}`}>{optionLabel}</span>
        {isMine && <span className="pin-badge" style={{ background: pinned ? 'rgba(124,45,0,0.3)' : 'rgba(107,114,128,0.2)', color: pinned ? '#7c2d00' : '#6b7280', border: 'none', padding: '2px 7px', borderRadius: '6px' }}>내가 작성</span>}
        <span className="comment-time">{formatTime(comment.createdAt)}</span>
      </div>
      <p className="comment-text">{comment.text}</p>

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.slice(0, visibleReplies).map(reply => {
            return (
              <div key={reply._id} className="reply-item">
                <div className="comment-header">
                  <span className={`choice-badge ${reply.choice}`}>{reply.choice === 'A' ? optionA : optionB}</span>
                  {typeof window !== 'undefined' && localStorage.getItem(`my_comment_${reply._id}`) && (
                    <span className="pin-badge" style={{ background: pinned ? 'rgba(124,45,0,0.3)' : 'rgba(107,114,128,0.2)', color: pinned ? '#7c2d00' : '#6b7280', border: 'none', padding: '2px 7px', borderRadius: '6px' }}>내가 작성</span>
                  )}
                  <span className="comment-time">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="comment-text">{reply.text}</p>
              </div>
            );
          })}
          {visibleReplies < comment.replies.length && (
            <button
              className="load-more-replies-btn"
              onClick={() => setVisibleReplies(v => v + 3)}
            >
              대댓글 더보기 ({comment.replies.length - visibleReplies}개 남음)
            </button>
          )}
        </div>
      )}

      <div className="comment-actions">
        <div className="reaction-btns">
          <button
            className={`reaction-btn${myReaction === 'like' ? ' active-like' : ''}`}
            onClick={readOnly ? undefined : () => handleReaction('like')}
            disabled={readOnly}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={myReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span>{likes > 0 ? likes : ''}</span>
          </button>
          <button
            className={`reaction-btn${myReaction === 'dislike' ? ' active-dislike' : ''}`}
            onClick={readOnly ? undefined : () => handleReaction('dislike')}
            disabled={readOnly}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={myReaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
              <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
            </svg>
            <span>{dislikes > 0 ? dislikes : ''}</span>
          </button>
        </div>
        {!readOnly && (
          <button className="reply-btn" onClick={toggleReply}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7"/>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
            {showReplyInput ? '취소' : '답글'}
          </button>
        )}
      </div>

      {!readOnly && showReplyInput && (
        <div className="reply-input-wrap">
          <span className={replyBadgeClass}>{replyBadgeText}</span>
          <input
            type="text"
            placeholder="대댓글 입력"
            maxLength={100}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitReply(); }}
            autoFocus
          />
          <button onClick={submitReply}>등록</button>
        </div>
      )}
    </div>
  );
}
