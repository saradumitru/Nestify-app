import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

function MoodboardsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [moodboards, setMoodboards] = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [favorites,  setFavorites]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [title,     setTitle]     = useState('');
  const [projId,    setProjId]    = useState('');
  const [creating,  setCreating]  = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const token = localStorage.getItem('token');

  const reload = async () => {
    const [b, p, f] = await Promise.all([
      api.get('/api/moodboards'),
      api.get('/api/projects'),
      api.get('/api/favorites'),
    ]);
    setMoodboards(b.data); setProjects(p.data); setFavorites(f.data);
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    reload().catch(() => toast.error('Eroare la încărcare.')).finally(() => setLoading(false));
    const pid = searchParams.get('projectId');
    if (pid) setProjId(pid);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/api/moodboards', { title, projectId: projId || null });
      setMoodboards(p => [res.data, ...p]);
      setTitle(''); setProjId(''); setShowCreate(false);
      toast.success('Moodboard creat!');
    } catch { toast.error('Eroare la creare.'); }
    setCreating(false);
  };

  const handleShare = async (id) => {
    try {
      const res = await api.post(`/api/moodboards/${id}/share`);
      const url = `${window.location.origin}/moodboards/public/${res.data.shareId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copiat în clipboard!');
    } catch { toast.error('Eroare la generarea link-ului.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ștergi moodboard-ul?')) return;
    try {
      await api.delete(`/api/moodboards/${id}`);
      setMoodboards(p => p.filter(b => b.id !== id));
      toast.success('Șters.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* Header */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">Design personal</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 8 }}>Moodboards</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>Organizează-ți inspirațiile în colecții tematice.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
            {showCreate ? '× Anulează' : '+ Moodboard nou'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} style={{ marginTop: 32, background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem' }}>Moodboard nou</h3>
            <input
              className="auth-input"
              placeholder="Ex: Dormitor Japandi, Living Minimalist…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            {projects.length > 0 && (
              <select className="moodboard-select" style={{ width: '100%' }} value={projId} onChange={e => setProjId(e.target.value)}>
                <option value="">Fără proiect</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
            <button className="btn btn-primary" type="submit" disabled={creating || !title.trim()}>
              {creating ? 'Se creează…' : 'Creează moodboard'}
            </button>
          </form>
        )}
      </div>

      <main style={{ padding: '48px 48px 100px' }}>
        {moodboards.length === 0 ? (
          <div className="empty-state">
            <h3>Nu ai încă moodboard-uri</h3>
            <p>Creează primul moodboard și adaugă imagini din favorite.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>Creează primul moodboard →</button>
          </div>
        ) : (
          <div className="moodboard-grid">
            {moodboards.map(board => {
              const previewImgs = (board.items || []).slice(0, 4).map(i => i.image);
              return (
                <article key={board.id} className="moodboard-card">
                  {/* Preview grid */}
                  <Link to={`/moodboards/${board.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="moodboard-card-preview" style={{ gridTemplateColumns: previewImgs.length >= 2 ? '1fr 1fr' : '1fr' }}>
                      {previewImgs.length === 0 && (
                        <div className="preview-fill" style={{ gridColumn: '1 / -1' }}>🎨</div>
                      )}
                      {previewImgs.map((im, idx) => im?.imageUrl
                        ? <img key={idx} src={img(im.imageUrl)} alt={im.title} />
                        : <div key={idx} className="preview-fill">📷</div>
                      )}
                      {previewImgs.length === 1 && <div className="preview-fill">+</div>}
                      {previewImgs.length === 3 && <div className="preview-fill">+</div>}
                    </div>
                    <div className="moodboard-card-body">
                      <h3 className="moodboard-card-title">{board.title}</h3>
                      <p className="moodboard-card-meta">
                        {(board.items || []).length} {(board.items || []).length === 1 ? 'imagine' : 'imagini'}
                        {board.project && ` · ${board.project.title}`}
                      </p>
                      {board.isPublic && (
                        <span className="moodboard-public-badge">🔗 Public</span>
                      )}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div style={{ padding: '0 22px 20px', display: 'flex', gap: 8, borderTop: '1px solid var(--cream-dark)', paddingTop: 14 }}>
                    <Link to={`/moodboards/${board.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                      Deschide
                    </Link>
                    <button className="btn btn-ghost btn-sm" title="Partajează" onClick={() => handleShare(board.id)}>🔗</button>
                    <button className="btn btn-ghost btn-sm" title="Șterge" onClick={() => handleDelete(board.id)} style={{ color: '#c0392b' }}>✕</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MoodboardsPage;
