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
  const [showRead, setShowRead] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', subject_id: '' });
  const [file, setFile] = useState(null);
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
    if (!form.title || !form.subject_id) {
      addToast('Fill all fields', 'error'); return;
    }
    if (!form.content && !file) {
      addToast('Add content or upload a file', 'error'); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content || ' ');
      formData.append('subject_id', form.subject_id);
      if (file) formData.append('file', file);

      await API.post('/notes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Note uploaded! 📚', 'success');
      setShowUpload(false);
      setForm({ title: '', content: '', subject_id: '' });
      setFile(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const handleGenerate = async noteId => {
    setGenerating(true);
    try {
      await API.post('/quiz/generate', { note_id: noteId, num_questions: 10 });
      addToast('Quiz generated with 10 questions! ⚡', 'success');
      setShowGenerate(null);
    } catch (err) {
      addToast(err.response?.data?.error || 'Generation failed', 'error');
    } finally { setGenerating(false); }
  };
  const handleDelete = async noteId => {
  if (!window.confirm('Delete this note?')) return;
  try {
    await API.delete(`/notes/${noteId}`);
    addToast('Note deleted!', 'success');
    load();
  } catch (err) {
    addToast('Delete failed', 'error');
  }
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
          <div className="page-subtitle">Upload notes · Read · Generate quizzes</div>
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
            <div key={n.id} className="card" style={{ borderColor: `${n.subject_color}44`, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = n.subject_color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${n.subject_color}44`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-primary">{n.subject_icon} {n.subject}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {n.file_type && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                      📎 {n.file_type.toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--text-bright)',
                letterSpacing: 1, marginBottom: 8 }}>{n.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {n.content}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  by <strong style={{ color: 'var(--text-main)' }}>{n.author}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleUpvote(n.id)}>▲ {n.upvotes}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowRead(n)}>📖 Read</button>
                  {user.id === n.user_id && (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowGenerate(n)}>⚡ Quiz It</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(255,71,87,0.15)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)' }}
                          onClick={() => handleDelete(n.id)}>🗑️</button>
                     </>
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
                <label className="form-label">Content (optional if uploading file)</label>
                <textarea className="form-textarea" style={{ minHeight: 120 }}
                  placeholder="Paste your notes here..."
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Upload File (PDF, TXT, DOCX)</label>
                <input type="file" accept=".pdf,.txt,.docx"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ color: 'var(--text-main)', fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.04)', padding: '10px',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                    width: '100%', cursor: 'pointer' }} />
                {file && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--xp-green)' }}>
                    ✅ Selected: {file.name}
                  </div>
                )}
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

      {/* Read Note Modal */}
      {showRead && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowRead(null); }}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">📖 {showRead.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {showRead.subject_icon} {showRead.subject} · by {showRead.author} · {new Date(showRead.created_at).toLocaleDateString()}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowRead(null)}>✕</button>
            </div>
            {/* Text content */}
            {showRead.content && showRead.content.trim() !== '' && (
               <div style={{
                 background: 'rgba(255,255,255,0.03)',
                 border: '1px solid var(--border)',
                 borderRadius: 'var(--radius)',
                 padding: '20px',
                 maxHeight: '40vh',
                 overflowY: 'auto',
                 whiteSpace: 'pre-wrap',
                 fontSize: '0.9rem',
                 color: 'var(--text-main)',
                 lineHeight: 1.8,
                 fontFamily: 'var(--font-body)'
              }}>
                {showRead.content}
              </div>
            )}

      {/* PDF Viewer */}
      {showRead.file_path && showRead.file_type === 'pdf' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>
            📄 PDF ATTACHMENT
          </div>
          <iframe
            src={`http://localhost:5000/api/notes/uploads/${showRead.file_path}`}
            style={{
              width: '100%',
              height: '500px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: '#fff'
           }}
           title="PDF Viewer"
          />
        </div>
      )}

       {/* Other file types */}
       {showRead.file_path && showRead.file_type !== 'pdf' && (
          <div style={{ marginTop: 12, padding: '10px 14px',
            background: 'rgba(0,245,255,0.08)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: 'var(--radius)',
            fontSize: '0.82rem', color: 'var(--secondary)' }}>
            📎 Attached {showRead.file_type?.toUpperCase()} file — readable by AI for quiz generation.
             <a href={`http://localhost:5000/api/notes/uploads/${showRead.file_path}`}
               target="_blank" rel="noreferrer"
               style={{ marginLeft: 10, color: 'var(--gold)', textDecoration: 'underline' }}>
               Download File
             </a>
          </div>
        )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowRead(null)}>Close</button>
              {user.id === showRead.user_id && (
                <button className="btn btn-primary btn-sm" onClick={() => { setShowRead(null); setShowGenerate(showRead); }}>
                  ⚡ Generate Quiz from this note
                </button>
              )}
            </div>
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
              The AI will analyze <strong style={{ color: 'var(--text-bright)' }}>"{showGenerate.title}"</strong> and generate <strong style={{ color: 'var(--secondary)' }}>10 quiz questions</strong>.
            </p>
            <div style={{ padding: '14px 18px', background: 'rgba(108,99,255,0.08)',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 24,
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--secondary)' }}>
              🤖 AI reads notes → Extracts concepts → Generates 10 unique questions
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowGenerate(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleGenerate(showGenerate.id)} disabled={generating}>
                {generating ? '⚡ Generating...' : '⚡ Generate 10 Questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}