'use client';

import { useState } from 'react';
import { IQuestion } from '@/types';

type AdminTab = 'add' | 'list';

export default function AdminModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('add');

  const [addQuestion, setAddQuestion] = useState('');
  const [addOptionA, setAddOptionA] = useState('');
  const [addOptionB, setAddOptionB] = useState('');
  const [addDate, setAddDate] = useState('');
  const [addMsg, setAddMsg] = useState('');

  const [questionList, setQuestionList] = useState<IQuestion[]>([]);

  function handleLogin() {
    const secret = secretInput.trim();
    if (!secret) return;
    setAdminSecret(secret);
    setIsAuthed(true);
  }

  async function handleAddQuestion() {
    if (!addQuestion || !addOptionA || !addOptionB || !addDate) {
      setAddMsg('모든 항목을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ question: addQuestion, optionA: addOptionA, optionB: addOptionB, date: addDate }),
      });
      const data = await res.json();
      if (!res.ok) { setAddMsg(data.error); return; }
      setAddMsg('문제가 추가되었습니다!');
      setAddQuestion(''); setAddOptionA(''); setAddOptionB(''); setAddDate('');
    } catch {
      setAddMsg('서버 오류');
    }
  }

  async function loadQuestions() {
    try {
      const [todayRes, archiveRes] = await Promise.all([
        fetch('/api/questions/today'),
        fetch('/api/questions/archive'),
      ]);
      const questions: IQuestion[] = [];
      if (todayRes.ok) questions.push(await todayRes.json());
      if (archiveRes.ok) questions.push(...(await archiveRes.json()));
      setQuestionList(questions);
    } catch {
      alert('서버 오류');
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': adminSecret },
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      setQuestionList(prev => prev.filter(q => q._id !== id));
    } catch {
      alert('서버 오류');
    }
  }

  if (!isOpen) {
    return (
      <button id="admin-trigger" title="관리자" onClick={() => setIsOpen(true)}>
        ···
      </button>
    );
  }

  return (
    <>
      <button id="admin-trigger" title="관리자" onClick={() => setIsOpen(true)}>
        ···
      </button>

      <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
        <div className="modal">
          <button className="modal-close" onClick={() => setIsOpen(false)}>✕</button>
          <h2>관리자 패널</h2>

          {!isAuthed ? (
            <div id="admin-auth-area">
              <input
                type="password"
                placeholder="관리자 시크릿 키"
                value={secretInput}
                onChange={e => setSecretInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              />
              <button onClick={handleLogin}>인증</button>
            </div>
          ) : (
            <div>
              <div className="admin-tabs">
                {(['add', 'list'] as AdminTab[]).map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                    onClick={() => { setActiveTab(tab); if (tab === 'list') loadQuestions(); }}
                  >
                    {tab === 'add' ? '문제 추가' : '문제 목록'}
                  </button>
                ))}
              </div>

              {activeTab === 'add' && (
                <div className="tab-content">
                  <input type="text" placeholder="질문" value={addQuestion} onChange={e => setAddQuestion(e.target.value)} />
                  <input type="text" placeholder="선택지 A" value={addOptionA} onChange={e => setAddOptionA(e.target.value)} />
                  <input type="text" placeholder="선택지 B" value={addOptionB} onChange={e => setAddOptionB(e.target.value)} />
                  <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} />
                  <button onClick={handleAddQuestion}>추가</button>
                  {addMsg && <p className="admin-msg">{addMsg}</p>}
                </div>
              )}

              {activeTab === 'list' && (
                <div className="tab-content">
                  <div>
                    {questionList.length === 0 && <p className="admin-msg">등록된 문제가 없습니다.</p>}
                    {questionList.map(q => (
                      <div key={q._id} className="admin-q-item">
                        <div className="admin-q-info">
                          <div className="admin-q-date">{q.date}</div>
                          <div>{q.question}</div>
                        </div>
                        <button className="admin-q-del" onClick={() => deleteQuestion(q._id)}>삭제</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
