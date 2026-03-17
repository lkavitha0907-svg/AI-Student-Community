import { useEffect, useRef, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get('/subjects/').then(r => setSubjects(r.data.subjects));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [activeSubject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = () => {
    const params = activeSubject ? `?subject_id=${activeSubject.id}` : '';
    API.get(`/chat/history${params}`).then(r => setMessages(r.data.messages));
  };

  const handleRoomChange = (subj) => {
    setActiveSubject(subj);
    setMessages([]);
  };

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await API.post('/chat/send', {
        message: input.trim(),
        subject_id: activeSubject?.id || null,
        is_global: !activeSubject
      });
      setInput('');
      loadHistory();
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false); }
  };

  // Auto refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, [activeSubject]);

  const formatTime = iso => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 64px)', display: 'flex', gap: 20 }}>
      {/* Channels sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.7rem', letterSpacing: 2,
          color: 'var(--text-muted)', marginBottom: 12 }}>CHANNELS</div>

        <div onClick={() => handleRoomChange(null)}
          style={{
            padding: '10px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
            background: !activeSubject ? 'rgba(108,99,255,0.15)' : 'transparent',
            border: `1px solid ${!activeSubject ? 'var(--primary)' : 'var(--border)'}`,
            color: !activeSubject ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600, marginBottom: 6, fontSize: '0.88rem', transition: 'all 0.2s'
          }}>
          🌐 General
        </div>

        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.65rem', letterSpacing: 2,
          color: 'var(--text-muted)', margin: '14px 0 8px' }}>SUBJECTS</div>

        {subjects.map(s => (
          <div key={s.id} onClick={() => handleRoomChange(s)}
            style={{
              padding: '9px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
              background: activeSubject?.id === s.id ? `${s.color}22` : 'transparent',
              border: `1px solid ${activeSubject?.id === s.id ? s.color : 'var(--border)'}`,
              color: activeSubject?.id === s.id ? s.color : 'var(--text-muted)',
              fontWeight: 500, marginBottom: 5, fontSize: '0.82rem',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
            }}>
            {s.icon} {s.name}
          </div>
        ))}

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--xp-green)',
            boxShadow: '0 0 8px var(--xp-green)' }} />
          Live (3s refresh)
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>{activeSubject ? activeSubject.icon : '🌐'}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--text-bright)', letterSpacing: 1 }}>
              {activeSubject ? activeSubject.name : 'General Chat'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {activeSubject ? 'Subject channel' : 'Chat with all students'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 4px 8px',
          display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.length === 0 && (
            <div className="empty-state" style={{ marginTop: 60 }}>
              <div className="empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p style={{ fontSize: '0.8rem', marginTop: 6 }}>Be the first to say something!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.user_id === user.id;
            const showHeader = i === 0 || messages[i - 1].user_id !== msg.user_id;
            return (
              <div key={msg.id || i}
                style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
                  gap: 10, alignItems: 'flex-end', padding: '2px 0' }}>
                {!isMe && showHeader && (
                  <div className="avatar" style={{ background: msg.avatar_color, width: 30, height: 30,
                    fontSize: '0.75rem', borderRadius: 8, flexShrink: 0 }}>
                    {msg.username[0].toUpperCase()}
                  </div>
                )}
                {!isMe && !showHeader && <div style={{ width: 30 }} />}
                <div style={{ maxWidth: '65%' }}>
                  {showHeader && !isMe && (
                    <div style={{ marginBottom: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {msg.username}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>LVL {msg.level}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatTime(msg.created_at)}</span>
                    </div>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                    border: `1px solid ${isMe ? 'transparent' : 'var(--border)'}`,
                    color: isMe ? '#fff' : 'var(--text-bright)',
                    fontSize: '0.88rem', lineHeight: 1.5,
                    boxShadow: isMe ? '0 0 15px var(--primary-glow)' : 'none',
                  }}>
                    {msg.message}
                  </div>
                  {isMe && (
                    <div style={{ textAlign: 'right', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatTime(msg.created_at)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage}
          style={{ display: 'flex', gap: 10, marginTop: 12,
            padding: '12px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <input
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-bright)', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
            placeholder={`Message ${activeSubject ? activeSubject.name : 'General'}...`}
            value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!input.trim() || sending}>
            {sending ? '...' : 'Send ▶'}
          </button>
        </form>
      </div>
    </div>
  );
}