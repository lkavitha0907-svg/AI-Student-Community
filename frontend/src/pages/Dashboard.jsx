import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/subjects/'),
      API.get('/quiz/'),
      API.get('/leaderboard/'),
    ]).then(([s, q, l]) => {
      setSubjects(s.data.subjects);
      setQuizzes(q.data.quizzes.slice(0, 4));
      setLeaderboard(l.data.leaderboard.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>Loading Arena...</span>
    </div>
  );

  const xpInLevel = user.total_xp % 200;
  const xpPct = (xpInLevel / 200) * 100;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="card card-glow" style={{ marginBottom: 28, background:
        'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,245,255,0.05) 100%)',
        borderColor: 'var(--border-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar lg" style={{ background: user.avatar_color,
            boxShadow: `0 0 30px ${user.avatar_color}55`, animation: 'pulse-glow 3s infinite' }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.7rem', color: 'var(--text-muted)',
              letterSpacing: 3, marginBottom: 4 }}>WELCOME BACK, PLAYER</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', fontWeight: 900,
              color: 'var(--text-bright)', textShadow: '0 0 20px var(--primary-glow)' }}>
              {user.username}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">LVL {user.level}</span>
              <span className="badge badge-cyan">⚡ {user.total_xp} XP</span>
            </div>
          </div>
          <div style={{ minWidth: 180 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)',
              marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>LEVEL PROGRESS</span><span>{xpInLevel}/200 XP</span>
            </div>
            <div className="xp-bar" style={{ height: 10 }}>
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '🏆', value: user.level, label: 'Current Level', color: 'rgba(255,215,0,0.15)' },
          { icon: '⚡', value: user.total_xp, label: 'Total XP', color: 'rgba(108,99,255,0.15)' },
          { icon: '📚', value: subjects.length, label: 'Subjects', color: 'rgba(0,245,255,0.1)' },
          { icon: '⚔️', value: quizzes.filter(q => !q.already_attempted).length, label: 'Quizzes Available', color: 'rgba(255,107,157,0.1)' },
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

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Active Quizzes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', letterSpacing: 2, color: 'var(--text-bright)' }}>
              ⚡ ACTIVE QUIZZES
            </h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/quiz')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quizzes.length === 0 && <div className="empty-state"><div className="empty-icon">⚡</div><h3>No quizzes yet</h3></div>}
            {quizzes.map(q => (
              <div key={q.id} className="card" style={{ padding: '16px 20px',
                borderColor: q.already_attempted ? 'var(--border)' : 'var(--border-glow)',
                opacity: q.already_attempted ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4, fontSize: '0.9rem' }}>
                      {q.subject_icon} {q.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {q.question_count} questions · {q.subject}
                    </div>
                  </div>
                  {q.already_attempted
                    ? <span className="badge badge-success">✓ Done</span>
                    : <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${q.id}`)}>Play</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Leaderboard */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', letterSpacing: 2, color: 'var(--text-bright)' }}>
              🏆 TOP PLAYERS
            </h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/leaderboard')}>Full Board</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((p, i) => (
              <div key={p.user_id} className="card" style={{ padding: '14px 18px',
                borderColor: i === 0 ? 'rgba(255,215,0,0.4)' : 'var(--border)',
                background: i === 0 ? 'rgba(255,215,0,0.05)' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', width: 28, textAlign: 'center' }}
                    className={i < 3 ? `rank-${i+1}` : ''}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </div>
                  <div className="avatar" style={{ background: p.avatar_color, width: 32, height: 32, fontSize: '0.8rem', borderRadius: 8 }}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.9rem' }}>{p.username}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LVL {p.level}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '0.85rem' }}>{p.total_score}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', letterSpacing: 2,
          color: 'var(--text-bright)', marginBottom: 16 }}>📚 SUBJECT ARENAS</h2>
        <div className="grid-auto">
          {subjects.map(s => (
            <div key={s.id} className="card" style={{ cursor: 'pointer', borderColor: `${s.color}44` }}
              onClick={() => navigate('/notes', { state: { subject_id: s.id } })}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${s.color}44`}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.8rem', color: 'var(--text-bright)',
                letterSpacing: 1, marginBottom: 6 }}>{s.name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-primary">{s.note_count} notes</span>
                <span className="badge badge-cyan">{s.quiz_count} quizzes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
