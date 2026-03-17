import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', identifier: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.identifier, form.password);
        addToast('Welcome back, Player! 🎮', 'success');
      } else {
        await register(form.username, form.email, form.password);
        addToast('Account created! Ready to play! ⚡', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.error || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', zIndex: 1
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 440 }} className="fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', fontWeight: 900,
            color: 'var(--primary)', textShadow: '0 0 40px var(--primary-glow)', letterSpacing: 4 }}>
            GAME<span style={{ color: 'var(--secondary)' }}>LEARN</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            letterSpacing: 3, marginTop: 6 }}>
            AI STUDENT ARENA
          </div>
        </div>

        <div className="card card-glow">
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28,
            background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-title)', fontSize: '0.7rem', letterSpacing: 2,
                  fontWeight: 700, transition: 'all 0.2s',
                  background: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 0 20px var(--primary-glow)' : 'none'
                }}>
                {m === 'login' ? '▶ LOGIN' : '+ REGISTER'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" placeholder="ChooseYourName" value={form.username}
                  onChange={set('username')} required />
              </div>
            )}
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@email.com"
                  value={form.email} onChange={set('email')} required />
              </div>
            )}
            {mode === 'login' && (
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input className="form-input" placeholder="Enter username or email"
                  value={form.identifier} onChange={set('identifier')} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit"
              disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? '...' : mode === 'login' ? '▶ ENTER ARENA' : '⚡ CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {mode === 'login' ? "New player? " : "Have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register here' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}
