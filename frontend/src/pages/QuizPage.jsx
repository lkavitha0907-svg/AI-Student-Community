import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

// ── Confetti Component ────────────────────────────────────────────────────────
function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#6C63FF','#00F5FF','#FFD700','#FF6B9D','#39FF14','#FF6B6B','#FFA500'];
    for (let i = 0; i < 180; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 12 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 + 2,
        vr: Math.random() * 0.1 - 0.05,
      });
    }
    let running = true;
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(animate);
    };
    animate();
    const timer = setTimeout(() => { running = false; }, 5000);
    return () => { running = false; clearTimeout(timer); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 9999
    }} />
  );
}

// ── Level Up Modal ────────────────────────────────────────────────────────────
function LevelUpModal({ oldLevel, newLevel, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        textAlign: 'center', padding: '48px 56px',
        background: 'var(--bg-card)',
        border: '2px solid var(--gold)',
        borderRadius: 24,
        boxShadow: '0 0 80px rgba(255,215,0,0.3)',
        animation: 'fadeIn 0.4s ease',
        maxWidth: 440
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 12, animation: 'float 2s infinite' }}>🏆</div>
        <div style={{
          fontFamily: 'var(--font-title)', fontSize: '1rem',
          color: 'var(--text-muted)', letterSpacing: 4, marginBottom: 8
        }}>LEVEL UP!</div>
        <div style={{
          fontFamily: 'var(--font-title)', fontSize: '3rem', fontWeight: 900,
          color: 'var(--gold)', textShadow: '0 0 40px rgba(255,215,0,0.6)',
          marginBottom: 8
        }}>LVL {newLevel}</div>
        <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          You advanced from <strong style={{ color: 'var(--text-bright)' }}>Level {oldLevel}</strong> to{' '}
          <strong style={{ color: 'var(--gold)' }}>Level {newLevel}</strong>!
        </div>
        <div style={{ fontSize: '1.5rem', marginBottom: 28, letterSpacing: 4 }}>🎉 👏 🎊</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
          color: 'var(--secondary)', marginBottom: 24,
          padding: '10px 16px', background: 'rgba(0,245,255,0.08)',
          borderRadius: 'var(--radius)', border: '1px solid rgba(0,245,255,0.2)'
        }}>
          Keep completing quizzes to reach Level {newLevel + 1}!
        </div>
        <button className="btn btn-primary btn-lg" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          🚀 Continue
        </button>
      </div>
    </div>
  );
}

// ── Quiz List ─────────────────────────────────────────────────────────────────
export function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/quiz/'), API.get('/subjects/')]).then(([q, s]) => {
      setQuizzes(q.data.quizzes);
      setSubjects(s.data.subjects);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? quizzes.filter(q => q.subject_id === parseInt(filter)) : quizzes;

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading Quizzes...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-title">⚡ QUIZ ARENA</div>
          <div className="page-subtitle">One attempt per quiz per day. Choose wisely.</div>
        </div>
        <select className="form-select" style={{ width: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h3>No quizzes available</h3>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Upload notes to generate quizzes!</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(q => (
            <div key={q.id} className="card card-glow" style={{
              borderColor: q.already_attempted ? 'var(--border)' : `${q.subject_color}66`,
              opacity: q.already_attempted ? 0.65 : 1,
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '2rem' }}>{q.subject_icon}</span>
                {q.already_attempted
                  ? <span className="badge badge-success">✓ Completed</span>
                  : <span className="badge badge-primary">Available</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--text-bright)', letterSpacing: 1, marginBottom: 6 }}>{q.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {q.subject} · {q.question_count} questions
              </div>
              {q.already_attempted ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--xp-green)' }}>
                  ✓ Score: {q.attempt?.score} pts · {q.attempt?.xp_earned} XP earned
                </div>
              ) : q.subject_attempted_today ? (
                <div style={{ fontSize: '0.78rem', color: '#ff4757', fontFamily: 'var(--font-mono)' }}>
                  🔒 Already took a {q.subject} quiz today
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${q.id}`)}>
                  ▶ Start Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quiz Player ───────────────────────────────────────────────────────────────
export function QuizPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    API.get(`/quiz/${id}`)
      .then(r => { setQuiz(r.data.quiz); setTimeLeft(r.data.quiz.question_count * 30); })
      .catch(err => {
        if (err.response?.status === 403) { addToast('Already attempted!', 'info'); navigate('/quiz'); }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft === 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]);

  const handleAnswer = (qId, opt) => setAnswers(a => ({ ...a, [qId]: opt }));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await API.post(`/quiz/${id}/submit`, { answers });
      setResult(r.data);
      await refreshUser();
      if (r.data.leveled_up) {
        setTimeout(() => setShowLevelUp(true), 600);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Submit failed', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading Quiz...</span></div>;
  if (!quiz) return null;

  // ── Result Screen ──
  if (result) {
    const pct = Math.round((result.score / (quiz.question_count * 10)) * 100);
    return (
      <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
        {result.leveled_up && <Confetti />}
        {showLevelUp && result.leveled_up && (
          <LevelUpModal
            oldLevel={result.old_level}
            newLevel={result.level}
            onClose={() => setShowLevelUp(false)}
          />
        )}

        {/* Score card */}
        <div className="card card-glow" style={{ textAlign: 'center', marginBottom: 20, borderColor: 'var(--border-glow)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 12, animation: 'float 2s infinite' }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--text-bright)', marginBottom: 8, letterSpacing: 2 }}>
            QUIZ COMPLETE!
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '3rem', color: 'var(--gold)', marginBottom: 4, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
            {result.score}
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>points scored</div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <span className="badge badge-success">⚡ +{result.xp_earned} XP</span>
            <span className="badge badge-primary">LVL {result.level}</span>
            <span className="badge badge-gold">{pct}% Accuracy</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(57,255,20,0.1)', color: 'var(--xp-green)', border: '1px solid rgba(57,255,20,0.3)' }}>
              ✅ {result.correct_count} Correct
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,71,87,0.1)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)' }}>
              ❌ {result.wrong_count} Wrong
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => setShowBreakdown(!showBreakdown)}>
              {showBreakdown ? '▲ Hide' : '📋 Review Answers'}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/quiz')}>Back to Quizzes</button>
            <button className="btn btn-primary" onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
          </div>
        </div>

        {/* Answer Breakdown */}
        {showBreakdown && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.8rem', letterSpacing: 2, color: 'var(--text-bright)', marginBottom: 4 }}>
              📋 ANSWER REVIEW
            </div>
            {result.breakdown.map((b, i) => (
              <div key={b.question_id} className="card" style={{
                borderColor: b.is_correct ? 'rgba(57,255,20,0.4)' : 'rgba(255,71,87,0.4)',
                background: b.is_correct ? 'rgba(57,255,20,0.04)' : 'rgba(255,71,87,0.04)'
              }}>
                {/* Question */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: b.is_correct ? 'rgba(57,255,20,0.2)' : 'rgba(255,71,87,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem'
                  }}>
                    {b.is_correct ? '✅' : '❌'}
                  </span>
                  <div style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Q{i + 1}. {b.question_text}
                  </div>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 38 }}>
                  {Object.entries(b.options).map(([key, val]) => {
                    const isCorrect = key === b.correct_answer;
                    const isUserAnswer = key === b.user_answer;
                    const isWrongAnswer = isUserAnswer && !isCorrect;

                    let bg = 'rgba(255,255,255,0.03)';
                    let border = 'var(--border)';
                    let color = 'var(--text-muted)';

                    if (isCorrect) { bg = 'rgba(57,255,20,0.1)'; border = 'rgba(57,255,20,0.5)'; color = 'var(--xp-green)'; }
                    if (isWrongAnswer) { bg = 'rgba(255,71,87,0.1)'; border = 'rgba(255,71,87,0.5)'; color = '#ff4757'; }

                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 'var(--radius)',
                        background: bg, border: `1px solid ${border}`,
                        fontSize: '0.85rem', color
                      }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                          background: isCorrect ? 'rgba(57,255,20,0.2)' : isWrongAnswer ? 'rgba(255,71,87,0.2)' : 'rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-title)', fontSize: '0.7rem', fontWeight: 700
                        }}>{key}</span>
                        <span style={{ flex: 1 }}>{val}</span>
                        {isCorrect && <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>✓ Correct</span>}
                        {isWrongAnswer && <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>✗ Your answer</span>}
                      </div>
                    );
                  })}
                  {b.user_answer === 'Skipped' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '4px 0' }}>
                      ⚠️ You skipped this question
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Quiz Player UI ──
  const q = quiz.questions[current];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = ((current + 1) / quiz.questions.length) * 100;

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2 }}>
            QUESTION {current + 1} OF {quiz.questions.length}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--text-bright)' }}>{quiz.title}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem',
          color: timeLeft < 30 ? '#ff4757' : 'var(--secondary)',
          textShadow: `0 0 20px ${timeLeft < 30 ? '#ff4757' : 'var(--secondary)'}` }}>
          {mins}:{secs}
        </div>
      </div>

      <div className="xp-bar" style={{ marginBottom: 28, height: 8 }}>
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card card-glow" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--text-bright)', fontWeight: 600, lineHeight: 1.6 }}>
          {q.question_text}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {Object.entries(q.options).map(([key, val]) => {
          const selected = answers[q.id] === key;
          return (
            <button key={key} onClick={() => handleAnswer(q.id, key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', borderRadius: 'var(--radius)',
                border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                background: selected ? 'rgba(108,99,255,0.15)' : 'var(--bg-card)',
                color: selected ? 'var(--text-bright)' : 'var(--text-main)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: selected ? '0 0 20px var(--primary-glow)' : 'none',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
              }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: selected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-title)', fontSize: '0.75rem', fontWeight: 700,
                color: selected ? '#fff' : 'var(--text-muted)',
              }}>{key}</span>
              {val}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
        <div style={{ display: 'flex', gap: 6 }}>
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{
                width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: answers[quiz.questions[i].id]
                  ? 'var(--primary)' : i === current ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)',
                color: 'var(--text-bright)', fontSize: '0.75rem', fontFamily: 'var(--font-title)',
              }}>{i + 1}</button>
          ))}
        </div>
        {current < quiz.questions.length - 1
          ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          : <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '...' : '✓ Submit Quiz'}
            </button>
        }
      </div>
    </div>
  );
}