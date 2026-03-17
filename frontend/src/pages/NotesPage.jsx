import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

export default function NotesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const initSubject = location.state?.subject_id || '';

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState(initSubject);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerate, setShowGenerate] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', subject_id: '' });
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    const params = filter ? `?subject_id=${filter}` : '';
    return API.get(`/notes/${params}`).then(r => setNotes(r.data.notes));
  };

  useEffect(() => {
    Promise.all([load(), API.get('/subjects/')]).then(([, s]) => {
      setSubjects(s.data.subjects);
    }).finally(() => setLoading(false));
  }, [filter]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.title || !form.content || !form.subject_id) {
      addToast('Fill all fields', 'error'); return;
    }
    setUploading(true);
    try {
      await API.post('/notes/', form);
      addToast('Note uploaded! 📚', 'success');
      setShowUpload(false);
      setForm({ title: '', content: '', subject_id: '' });
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const handleGenerate = async noteId => {
    setGenerating(true);
    try {
      await API.post('/quiz/generate', { note_id: noteId, num_questions: 5 });
      addToast('Quiz generated! ⚡ Check the Quiz Arena!', 'success');
      setShowGenerate(null);
    } catch (err) {
      addToast(err.response?.data?.error || 'Generation failed', 'error');
    } finally { setGenerating(false); }
  };

  const handleUpvote = async noteId => {
    await API.post(`/notes/${noteId}/upvote`);
    setNotes(ns => ns.map(n => n.id === noteId ? { ...n, upvotes: n.upvotes + 1 } : n));
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading Notes...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-title">📚 KNOWLEDGE BASE</div>
          <div className="page-subtitle">Upload notes · Share knowledge · Generate quizzes</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>+ Upload Note</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Search notes..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No notes found</h3>
          <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Be the first to upload!</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(n => (
            <div key={n.id} className="card" style={{ borderColor: `${n.subject_color}44`,
              transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = n.subject_color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${n.subject_color}44`}>
              {/* Subject tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-primary">{n.subject_icon} {n.subject}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--text-bright)',
                letterSpacing: 1, marginBottom: 8 }}>{n.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {n.content}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by <strong style={{ color: 'var(--text-main)' }}>{n.author}</strong></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleUpvote(n.id)}>
                    ▲ {n.upvotes}
                  </button>
                  {user.id === n.user_id && (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowGenerate(n)}>
                      ⚡ Quiz It
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">📤 UPLOAD NOTE</div>
              <button className="modal-close" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" value={form.subject_id}
                  onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="Note title..." value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-textarea" style={{ minHeight: 180 }}
                  placeholder="Paste your notes here. The AI will read this to generate quiz questions..."
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? '...' : '📤 Upload Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showGenerate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowGenerate(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">⚡ GENERATE QUIZ</div>
              <button className="modal-close" onClick={() => setShowGenerate(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
              The AI will analyze "<strong style={{ color: 'var(--text-bright)' }}>{showGenerate.title}</strong>" and generate 5 quiz questions.
            </p>
            <div style={{ padding: '14px 18px', background: 'rgba(108,99,255,0.08)',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 24,
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--secondary)' }}>
              🤖 AI reads notes → Extracts concepts → Generates unique questions per student
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowGenerate(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleGenerate(showGenerate.id)} disabled={generating}>
                {generating ? '⚡ Generating...' : '⚡ Generate Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
