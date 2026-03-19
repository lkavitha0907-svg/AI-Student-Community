import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/quiz',      icon: '⚡', label: 'Quizzes' },
  { to: '/notes',     icon: '📚', label: 'Notes' },
  { to: '/chat',      icon: '💬', label: 'Chat' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { to: '/rules',       icon: '📜', label: 'Rules' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const xpInLevel = user.total_xp % 200;
  const xpPct = (xpInLevel / 200) * 100;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>GAME<span>LEARN</span></h1>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
          STUDENT ARENA v1.0
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: user.avatar_color }}>
          {user.username[0].toUpperCase()}
        </div>
        <div className="user-info">
          <div className="username">{user.username}</div>
          <div className="level-badge">LVL {user.level} PLAYER</div>
        </div>
      </div>

      <div className="xp-bar-wrap">
        <div className="xp-label">
          <span>XP</span>
          <span>{user.total_xp} / {user.level * 200}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
