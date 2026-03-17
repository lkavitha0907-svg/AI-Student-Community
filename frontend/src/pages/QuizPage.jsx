import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

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
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--text-bright)',
                letterSpacing: 1, marginBottom: 6 }}>{q.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {q.subject} · {q.question_count} questions
              </div>
              {q.already_attempted ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--xp-green)' }}>
                  Score: {q.attempt?.score} pts · {q.attempt?.xp_earned} XP earned
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

  useEffect(() => {
    API.get(`/quiz/${id}`)
      .then(r => {
        setQuiz(r.data.quiz);
        setTimeLeft(r.data.quiz.question_count * 30);
      })
      .catch(err => {
        if (err.response?.status === 403) {
          addToast('Already attempted this quiz today!', 'info');
          navigate('/quiz');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Timer
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
    } catch (err) {
      addToast(err.response?.data?.error || 'Submit failed', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading Quiz...</span></div>;
  if (!quiz) return null;

  // Result screen
  if (result) {
    const pct = Math.round((result.score / (quiz.question_count * 10)) * 100);
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
        <div className="card card-glow" style={{ borderColor: 'var(--border-glow)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16, animation: 'float 2s infinite' }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--text-bright)',
            marginBottom: 8, letterSpacing: 2 }}>QUIZ COMPLETE!</div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '3rem', color: 'var(--gold)',
            marginBottom: 4, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>{result.score}</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>points scored</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <span className="badge badge-success">⚡ +{result.xp_earned} XP</span>
            <span className="badge badge-primary">LVL {result.level}</span>
            <span className="badge badge-gold">{pct}% Accuracy</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/quiz')}>Back to Quizzes</button>
            <button className="btn btn-primary" onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[current];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = ((current + 1) / quiz.questions.length) * 100;

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
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

      {/* Progress bar */}
      <div className="xp-bar" style={{ marginBottom: 28, height: 8 }}>
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="card card-glow" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--text-bright)',
          fontWeight: 600, lineHeight: 1.6 }}>{q.question_text}</div>
      </div>

      {/* Options */}
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

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}>← Previous</button>
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
