'use client';

import { useState } from 'react';
import { IComment, VoteChoice } from '@/types';
import { MOCK_COMMENTS } from '@/lib/mockData';

interface CommentItemProps {
  comment: IComment;
  questionId: string;
  myChoice: VoteChoice;
  optionA: string;
  optionB: string;
  isMock: boolean;
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
  onReply,
  formatTime,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const optionLabel = comment.choice === 'A' ? optionA : optionB;

  function toggleReply() {
    setShowReplyInput(prev => !prev);
    setReplyText('');
  }

  async function submitReply() {
    const text = replyText.trim();
    if (!text) return;

    if (isMock) {
      const parent = MOCK_COMMENTS.find(c => c._id === comment._id);
      if (parent) {
        parent.replies.push({
          _id: `r${Date.now()}`,
          questionId,
          parentId: comment._id,
          choice: myChoice,
          text,
          createdAt: new Date().toISOString(),
          replies: [],
        });
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
    <div className="comment-item">
      <div className="comment-header">
        <span className={`choice-badge ${comment.choice}`}>{optionLabel}</span>
        <span className="comment-time">{formatTime(comment.createdAt)}</span>
      </div>
      <p className="comment-text">{comment.text}</p>

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => {
            const replyLabel = reply.choice === 'A' ? optionA : optionB;
            return (
              <div key={reply._id} className="reply-item">
                <div className="comment-header">
                  <span className={`choice-badge ${reply.choice}`}>{replyLabel}</span>
                  <span className="comment-time">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="comment-text">{reply.text}</p>
              </div>
            );
          })}
        </div>
      )}

      <button className="reply-btn" onClick={toggleReply}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 17 4 12 9 7"/>
          <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
        </svg>
        {showReplyInput ? '취소' : '답글'}
      </button>

      {showReplyInput && (
        <div className="reply-input-wrap">
          <span className={replyBadgeClass}>{replyBadgeText}</span>
          <input
            type="text"
            placeholder="대댓글 입력 (최대 100자)"
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
