'use client';

import { useState } from 'react';
import { IQuestion } from '@/types';

export default function ArchiveModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  async function openArchive() {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch('/api/questions/archive');
      if (!res.ok) throw new Error('failed');
      const data: IQuestion[] = await res.json();
      setQuestions(data);
    } catch {
      alert('서버 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="ghost-btn" onClick={openArchive}>
        지난 문제 보기
      </button>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="modal">
            <button className="modal-close" onClick={() => setIsOpen(false)}>✕</button>
            <h2>지난 문제</h2>
            <div>
              {loading ? (
                <p style={{ color: '#aaa' }}>불러오는 중...</p>
              ) : questions.length === 0 ? (
                <p style={{ color: '#aaa' }}>지난 문제가 없습니다.</p>
              ) : (
                questions.map(q => (
                  <div key={q._id} className="archive-item">
                    <div className="arc-date">{q.date}</div>
                    <div className="arc-q">{q.question}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
