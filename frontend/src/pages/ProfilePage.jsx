import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import API from '../utils/api';

const COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#F0A500','#DDA0DD','#FF8C42','#00F5FF','#FF6B9D'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [attempts, setAttempts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedColor, setSelectedColor] = useState(user.avatar_color);

  useEffect(() => {
    API.get('/quiz/').then(r => {
      setAttempts(r.data.quizzes.filter(q => q.already_attempted && q.attempt));
    });
    API.get('/notes/').then(r => {
      setNotes(r.data.notes.filter(n => n.user_id === user.id));
    });
  }, []);

  const saveColor = async () => {
    await API.put('/auth/profile', { avatar_color: selectedColor });
    await refreshUser();
    addToast('Avatar updated!', 'success');
  };

  const xpInLevel = user.total_xp % 200;
  const xpPct = (xpInLevel / 200) * 100;
  const totalScore = attempts.reduce((sum, a) => sum + (a.attempt?.score || 0), 0);

  return (
    <div className="fade-in">
      <div className="page-title" style={{ marginBottom: 28 }}>👤 PLAYER PROFILE</div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Profile card */}
        <div className="card card-glow">
          <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
            <div className="avatar lg" style={{
              background: selectedColor, margin: '0 auto 16px',
              width: 80, height: 80, fontSize: '2rem', borderRadius: 20,
              boxShadow: `0 0 40px ${selectedColor}66`, animation: 'pulse-glow 3s infinite',
              border: '3px solid rgba(255,255,255,0.15)'
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--text-bright)',
              letterSpacing: 2, marginBottom: 6 }}>{user.username}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <span className="badge badge-primary">LVL {user.level}</span>
              <span className="badge badge-gold">🏆 {totalScore} pts</span>
              <span className="badge badge-cyan">⚡ {user.total_xp} XP</span>
            </div>

            {/* XP progress */}
            <div style={{ padding: '0 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>LVL {user.level}</span>
                <span>{xpInLevel}/200 XP</span>
                <span>LVL {user.level + 1}</span>
              </div>
              <div className="xp-bar" style={{ height: 10 }}>
                <div className="xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Color picker */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)',
              letterSpacing: 1, marginBottom: 12 }}>CHOOSE AVATAR COLOR</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setSelectedColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer',
                    border: selectedColor === c ? '3px solid #fff' : '3px solid transparent',
                    boxShadow: selectedColor === c ? `0 0 12px ${c}` : 'none',
                    transition: 'all 0.2s',
                  }} />
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveColor}>Save Avatar</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { icon: '🎮', label: 'Quizzes Taken', value: attempts.length, color: 'rgba(108,99,255,0.15)' },
              { icon: '📚', label: 'Notes Uploaded', value: notes.length, color: 'rgba(0,245,255,0.1)' },
              { icon: '🏆', label: 'Total Score', value: totalScore, color: 'rgba(255,215,0,0.1)' },
              { icon: '⚡', label: 'Total XP', value: user.total_xp, color: 'rgba(57,255,20,0.08)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quiz history */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.8rem', letterSpacing: 2,
              color: 'var(--text-bright)', marginBottom: 14 }}>QUIZ HISTORY</div>
            {attempts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                No quizzes attempted yet. Jump into the arena!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attempts.slice(0, 6).map(q => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-bright)', fontWeight: 500 }}>
                        {q.subject_icon} {q.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(q.attempt.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '0.85rem' }}>
                        {q.attempt.score} pts
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--xp-green)' }}>+{q.attempt.xp_earned} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
