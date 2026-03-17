'use client';

import { useState } from 'react';
import { IQuestion } from '@/types';

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  const [addQuestion, setAddQuestion] = useState('');
  const [addOptionA, setAddOptionA] = useState('');
  const [addOptionB, setAddOptionB] = useState('');
  const [addDate, setAddDate] = useState('');
  const [addMsg, setAddMsg] = useState('');

  const [questionList, setQuestionList] = useState<IQuestion[]>([]);
  const [listMsg, setListMsg] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ question: '', optionA: '', optionB: '', date: '' });

  const [loginMsg, setLoginMsg] = useState('');

  async function handleLogin() {
    const secret = secretInput.trim();
    if (!secret) return;
    setLoginMsg('확인 중...');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
      });
      if (!res.ok) {
        setLoginMsg('❌ 비밀번호가 틀렸습니다.');
        return;
      }
      setAdminSecret(secret);
      setIsAuthed(true);
      setLoginMsg('');
    } catch {
      setLoginMsg('❌ 서버 오류');
    }
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
      setAddMsg('✅ 문제가 추가되었습니다!');
      setAddQuestion(''); setAddOptionA(''); setAddOptionB(''); setAddDate('');
    } catch {
      setAddMsg('❌ 서버 오류');
    }
  }

  async function loadQuestions() {
    setListMsg('불러오는 중...');
    try {
      const [todayRes, archiveRes] = await Promise.all([
        fetch('/api/questions/today'),
        fetch('/api/questions/archive'),
      ]);
      const questions: IQuestion[] = [];
      if (todayRes.ok) questions.push(await todayRes.json());
      if (archiveRes.ok) questions.push(...(await archiveRes.json()));
      setQuestionList(questions);
      setListMsg(questions.length === 0 ? '등록된 문제가 없습니다.' : '');
    } catch {
      setListMsg('❌ 서버 오류');
    }
  }

  function startEdit(q: IQuestion) {
    setEditingId(q._id);
    setEditFields({ question: q.question, optionA: q.optionA, optionB: q.optionB, date: q.date });
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify(editFields),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      setQuestionList(prev => prev.map(q => q._id === id ? { ...q, ...editFields } : q));
      setEditingId(null);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        color: '#f1f5f9',
      }}>
        <h1 style={{ margin: '0 0 24px', fontSize: '1.4rem', fontWeight: 700 }}>🛠 관리자 페이지</h1>

        {!isAuthed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="관리자 시크릿 키"
              value={secretInput}
              onChange={e => setSecretInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              style={inputStyle}
            />
            <button onClick={handleLogin} style={btnStyle}>인증</button>
            {loginMsg && <p style={{ margin: 0, fontSize: '0.9rem', color: loginMsg.startsWith('❌') ? '#f87171' : '#94a3b8' }}>{loginMsg}</p>}
          </div>
        ) : (
          <div>
            {/* 탭 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {(['add', 'list'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab === 'list') loadQuestions(); }}
                  style={{
                    ...tabBtnStyle,
                    background: activeTab === tab ? '#3b82f6' : '#334155',
                    color: activeTab === tab ? '#fff' : '#94a3b8',
                  }}
                >
                  {tab === 'add' ? '문제 추가' : '문제 목록'}
                </button>
              ))}
            </div>

            {activeTab === 'add' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="질문" value={addQuestion} onChange={e => setAddQuestion(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="선택지 A" value={addOptionA} onChange={e => setAddOptionA(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="선택지 B" value={addOptionB} onChange={e => setAddOptionB(e.target.value)} style={inputStyle} />
                <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} style={inputStyle} />
                <button onClick={handleAddQuestion} style={btnStyle}>추가</button>
                {addMsg && <p style={{ margin: 0, fontSize: '0.9rem', color: addMsg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{addMsg}</p>}
              </div>
            )}

            {activeTab === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {listMsg && <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>{listMsg}</p>}
                {questionList.map(q => (
                  <div key={q._id} style={{
                    background: '#0f172a',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    {editingId === q._id ? (
                      <>
                        <input value={editFields.question} onChange={e => setEditFields(p => ({ ...p, question: e.target.value }))} placeholder="질문" style={inputStyle} />
                        <input value={editFields.optionA} onChange={e => setEditFields(p => ({ ...p, optionA: e.target.value }))} placeholder="선택지 A" style={inputStyle} />
                        <input value={editFields.optionB} onChange={e => setEditFields(p => ({ ...p, optionB: e.target.value }))} placeholder="선택지 B" style={inputStyle} />
                        <input type="date" value={editFields.date} onChange={e => setEditFields(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => saveEdit(q._id)} style={{ ...btnStyle, flex: 1 }}>저장</button>
                          <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: '#475569', flex: 1 }}>취소</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>{q.date}</div>
                          <div style={{ fontSize: '0.92rem' }}>{q.question}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>A: {q.optionA} / B: {q.optionB}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button onClick={() => startEdit(q)} style={{ ...btnStyle, background: '#0ea5e9', padding: '6px 14px', fontSize: '0.82rem' }}>수정</button>
                          <button onClick={() => deleteQuestion(q._id)} style={{ ...btnStyle, background: '#dc2626', padding: '6px 14px', fontSize: '0.82rem' }}>삭제</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const tabBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
};
