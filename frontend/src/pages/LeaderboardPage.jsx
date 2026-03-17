import { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
  const intervalRef = useRef(null);

  const load = () => {
    API.get('/leaderboard/').then(r => {
      setBoard(r.data.leaderboard);
      const me = r.data.leaderboard.find(p => p.user_id === user.id);
      if (me) setMyRank(me);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading Rankings...</span></div>;

  const top3 = board.slice(0, 3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [160, 200, 130];
  const podiumEmoji = ['🥈', '🥇', '🥉'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🏆 LEADERBOARD</div>
        <div className="page-subtitle">Live rankings · Updates every 15 seconds</div>
      </div>

      {/* My rank banner */}
      {myRank && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--border-glow)',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--gold)',
              textShadow: '0 0 20px rgba(255,215,0,0.4)', minWidth: 60, textAlign: 'center' }}>
              #{myRank.rank}
            </div>
            <div className="avatar lg" style={{ background: myRank.avatar_color }}>
              {myRank.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--text-bright)' }}>
                YOUR RANKING — {myRank.username}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-gold">🏆 {myRank.total_score} pts</span>
                <span className="badge badge-primary">LVL {myRank.level}</span>
                <span className="badge badge-cyan">⚡ {myRank.total_xp} XP</span>
                <span className="badge badge-success">{myRank.quizzes_taken} quizzes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podium — only shows when 3+ players */}
      {top3.length === 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          gap: 16, marginBottom: 40, padding: '20px 0' }}>
          {podiumOrder.map((p, i) => (
            <div key={p.user_id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 10,
                animation: i === 1 ? 'float 3s infinite' : 'none' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{podiumEmoji[i]}</div>
                <div className="avatar" style={{
                  background: p.avatar_color, margin: '0 auto 6px',
                  width: i === 1 ? 56 : 44, height: i === 1 ? 56 : 44,
                  fontSize: i === 1 ? '1.4rem' : '1.1rem', borderRadius: 14,
                  boxShadow: i === 1 ? `0 0 30px ${p.avatar_color}88` : 'none',
                  border: i === 1 ? '2px solid var(--gold)' : 'none'
                }}>
                  {p.username[0].toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.7rem',
                  color: i === 1 ? 'var(--gold)' : 'var(--text-bright)', letterSpacing: 1 }}>
                  {p.username}
                </div>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: i === 1 ? '1.1rem' : '0.85rem',
                  color: 'var(--gold)', marginTop: 2 }}>{p.total_score} pts</div>
              </div>
              <div style={{
                width: i === 1 ? 120 : 90, height: podiumHeights[i],
                background: i === 1
                  ? 'linear-gradient(180deg, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.08) 100%)'
                  : 'linear-gradient(180deg, rgba(108,99,255,0.2) 0%, rgba(108,99,255,0.06) 100%)',
                border: `2px solid ${i === 1 ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: '12px 12px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-title)', fontSize: i === 1 ? '1.8rem' : '1.3rem',
                color: i === 1 ? 'var(--gold)' : 'var(--text-muted)',
              }}>
                {p.rank}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full table — ALL players */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-title)', fontSize: '0.7rem', letterSpacing: 2,
          color: 'var(--text-muted)', display: 'grid',
          gridTemplateColumns: '60px 1fr 100px 80px 100px 80px' }}>
          <span>RANK</span><span>PLAYER</span><span>SCORE</span>
          <span>LEVEL</span><span>XP</span><span>QUIZZES</span>
        </div>

        {board.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No players yet</h3>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Complete a quiz to appear here!</p>
          </div>
        )}

        {board.map((p, i) => {
          const isMe = p.user_id === user.id;
          return (
            <div key={p.user_id}
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 80px 100px 80px',
                alignItems: 'center',
                background: isMe ? 'rgba(108,99,255,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'; }}>
              <span style={{ fontFamily: 'var(--font-title)', color: i < 3 ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${p.rank}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ background: p.avatar_color, width: 32, height: 32,
                  fontSize: '0.8rem', borderRadius: 8, border: isMe ? '2px solid var(--primary)' : 'none' }}>
                  {p.username[0].toUpperCase()}
                </div>
                <span style={{ color: isMe ? 'var(--primary)' : 'var(--text-bright)',
                  fontWeight: isMe ? 700 : 500, fontSize: '0.9rem' }}>
                  {p.username} {isMe && '(you)'}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '0.9rem' }}>
                {p.total_score}
              </span>
              <span style={{ color: 'var(--secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {p.level}
              </span>
              <span style={{ color: 'var(--xp-green)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {p.total_xp}
              </span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {p.quizzes_taken}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}