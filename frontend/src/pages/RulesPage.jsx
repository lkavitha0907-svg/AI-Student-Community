import { useNavigate } from 'react-router-dom';

const RULES = [
  {
    icon: '📚',
    title: 'Notes Upload Rules',
    color: '#4ECDC4',
    rules: [
      'Upload only relevant study notes related to the subject you select.',
      'Do not upload random, irrelevant, or duplicate content.',
      'Notes must be in English and related to the chosen subject.',
      'Accepted file formats: PDF, TXT, DOCX.',
      'Maximum file size: 16MB per upload.',
      'Notes you upload are visible to all students for studying.',
      'Uploading spam or inappropriate content will result in removal.',
    ]
  },
  {
    icon: '⚡',
    title: 'Quiz Rules',
    color: '#6C63FF',
    rules: [
      'You can attempt each quiz only ONCE — no second chances.',
      'Only ONE quiz per subject is allowed per day.',
      'Come back tomorrow to attempt another quiz in the same subject.',
      'The quiz has a countdown timer — answer all questions before time runs out.',
      'Unanswered questions will be counted as wrong.',
      'You cannot go back and change answers after submitting.',
      'Each correct answer earns 10 points.',
      'Completing a quiz earns a 50 XP bonus regardless of score.',
    ]
  },
  {
    icon: '🏆',
    title: 'Scoring and XP Rules',
    color: '#FFD700',
    rules: [
      'Your score is based on correct answers only (10 points each).',
      'XP (Experience Points) determine your player level.',
      'Leaderboard rank is based on total score not XP.',
      'You cannot lose XP or points once earned.',
      'Leaderboard updates every 15 seconds in real time.',
      'Top 3 players on the leaderboard get a special podium display.',
    ]
  },
  {
    icon: '🎮',
    title: 'Level Up System',
    color: '#FF6B9D',
    rules: [
      'Level 1 → Level 2: Earn 300 XP',
      'Level 2 → Level 3: Earn 800 XP total',
      'Level 3 → Level 4: Earn 1500 XP total',
      'Level 4 → Level 5: Earn 2500 XP total',
      'Level 5 → Level 6: Earn 4000 XP total',
      'Higher levels require progressively more XP to reach.',
      'Your level is shown on your profile, sidebar, and leaderboard.',
    ]
  },
  {
    icon: '💬',
    title: 'Chat Rules',
    color: '#45B7D1',
    rules: [
      'Be respectful to all students at all times.',
      'No sharing quiz answers or solutions in chat.',
      'No spamming or flooding the chat with repeated messages.',
      'Use subject channels for topic-specific discussions.',
      'Use the General channel for casual conversation.',
      'No offensive, abusive, or inappropriate language.',
      'No sharing personal information of other students.',
    ]
  },
  {
    icon: '👤',
    title: 'Account Rules',
    color: '#96CEB4',
    rules: [
      'Each student must have only one account.',
      'Do not share your account credentials with others.',
      'Your username must be appropriate and not offensive.',
      'You are responsible for all activity on your account.',
      'Attempting to exploit bugs or cheat the system is not allowed.',
    ]
  },
];

const XP_TABLE = [
  { level: 1, xp: 0, title: 'Rookie' },
  { level: 2, xp: 300, title: 'Learner' },
  { level: 3, xp: 800, title: 'Student' },
  { level: 4, xp: 1500, title: 'Scholar' },
  { level: 5, xp: 2500, title: 'Expert' },
  { level: 6, xp: 4000, title: 'Master' },
  { level: 7, xp: 6000, title: 'Champion' },
  { level: 8, xp: 8500, title: 'Legend' },
  { level: 9, xp: 11500, title: 'Elite' },
  { level: 10, xp: 15000, title: 'Grandmaster' },
];

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-title">📜 RULES & GUIDELINES</div>
        <div className="page-subtitle">Read carefully before playing — knowledge is power!</div>
      </div>

      {/* Welcome banner */}
      <div className="card" style={{
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,245,255,0.05) 100%)',
        borderColor: 'var(--border-glow)'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '3rem' }}>🎮</div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--text-bright)', letterSpacing: 2, marginBottom: 8 }}>
              WELCOME TO GAMELEARN ARENA
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 700 }}>
              GameLearn is an AI-powered student community platform where you upload notes,
              generate quizzes, compete on the leaderboard, and chat with fellow students.
              Please follow these rules to ensure a fair and enjoyable experience for everyone.
            </div>
          </div>
        </div>
      </div>

      {/* Rules sections */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 32 }}>
        {RULES.map((section, i) => (
          <div key={i} className="card" style={{ borderColor: `${section.color}44` }}
            onMouseEnter={e => e.currentTarget.style.borderColor = section.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${section.color}44`}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${section.color}22`,
                border: `1px solid ${section.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                {section.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.8rem',
                color: section.color, letterSpacing: 2 }}>
                {section.title}
              </div>
            </div>

            {/* Rules list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.rules.map((rule, j) => (
                <div key={j} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: `${section.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-title)', fontSize: '0.65rem',
                    color: section.color, fontWeight: 700, marginTop: 1
                  }}>{j + 1}</span>
                  {rule}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* XP Level table */}
      <div className="card card-glow" style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', letterSpacing: 2,
          color: 'var(--text-bright)', marginBottom: 20 }}>
          ⚡ XP LEVEL PROGRESSION TABLE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {XP_TABLE.map((row, i) => (
            <div key={i} style={{
              padding: '14px 12px', textAlign: 'center',
              background: i === 0 ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem',
                color: i >= 7 ? 'var(--gold)' : i >= 4 ? 'var(--secondary)' : 'var(--primary)',
                marginBottom: 4 }}>
                {row.level}
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.6rem',
                color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>
                {row.title.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--xp-green)' }}>
                {row.xp === 0 ? 'Start' : `${row.xp} XP`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick summary */}
      <div className="card" style={{ marginBottom: 32, borderColor: 'rgba(255,215,0,0.3)',
        background: 'rgba(255,215,0,0.04)' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', letterSpacing: 2,
          color: 'var(--gold)', marginBottom: 16 }}>
          🌟 QUICK SUMMARY — REMEMBER THESE!
        </div>
        <div className="grid-3" style={{ gap: 12 }}>
          {[
            { icon: '1️⃣', text: 'One quiz attempt per quiz — no retries' },
            { icon: '📅', text: 'One quiz per subject per day' },
            { icon: '📚', text: 'Upload relevant notes only' },
            { icon: '🤫', text: 'No sharing answers in chat' },
            { icon: '👤', text: 'One account per student' },
            { icon: '🤝', text: 'Be respectful to everyone' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem', color: 'var(--text-main)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}
          style={{ justifyContent: 'center' }}>
          🎮 I Understand — Let's Play!
        </button>
      </div>
    </div>
  );
}