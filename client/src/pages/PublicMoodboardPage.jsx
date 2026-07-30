import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function PublicMoodboardPage() {
  const { shareId } = useParams();

  const [moodboard, setMoodboard] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get(`/api/moodboards/public/${shareId}`)
      .then(r => setMoodboard(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shareId]);

  const handleLike = async () => {
    if (!token || !moodboard) return;

    const wasLiked = moodboard.likedByMe;
    setMoodboard(prev => ({
      ...prev,
      likedByMe: !wasLiked,
      likesCount: wasLiked ? (prev.likesCount || 1) - 1 : (prev.likesCount || 0) + 1,
    }));

    try {
      const res = await api.post(`/api/moodboards/${moodboard.id}/like`);
      setMoodboard(prev => ({ ...prev, likedByMe: res.data.liked, likesCount: res.data.likesCount }));
    } catch {
      setMoodboard(prev => ({
        ...prev,
        likedByMe: wasLiked,
        likesCount: wasLiked ? (prev.likesCount || 0) + 1 : (prev.likesCount || 1) - 1,
      }));
    }
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  if (!moodboard) return (
    <div className="museum-home">
      <Navbar />
      <div style={{ padding: '80px 48px', textAlign: 'center' }} className="empty-state">
        <h3>Moodboard indisponibil</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Acest link nu mai este valid sau a fost dezactivat.</p>
        <Link to="/" className="btn btn-primary">Acasă</Link>
      </div>
    </div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Header ── */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)', textAlign: 'center' }}>
        <span className="museum-kicker">Moodboard public · Nestify</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          {moodboard.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 16px' }}>
          {moodboard.items?.length || 0} {moodboard.items?.length === 1 ? 'cameră' : 'camere'} în această colecție
        </p>

        {/* Stats + like */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 28 }}>
          {moodboard.views > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Eye size={14} strokeWidth={1.5} />
              {moodboard.views} {moodboard.views === 1 ? 'vizualizare' : 'vizualizări'}
            </span>
          )}

          <button
            onClick={handleLike}
            disabled={!token}
            title={token ? (moodboard.likedByMe ? 'Elimină like' : 'Apreciază acest moodboard') : 'Autentifică-te pentru a da like'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: moodboard.likedByMe ? '#fdf2f2' : 'var(--white)',
              border: `1px solid ${moodboard.likedByMe ? '#f5c6c6' : 'var(--card-border)'}`,
              cursor: token ? 'pointer' : 'default',
              padding: '7px 14px',
              color: moodboard.likedByMe ? '#c0392b' : 'var(--text-muted)',
              fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', fontWeight: 400,
              transition: 'all 0.15s',
            }}
          >
            <Heart size={15} strokeWidth={1.5} fill={moodboard.likedByMe ? 'currentColor' : 'none'} />
            {(moodboard.likesCount || 0) > 0
              ? `${moodboard.likesCount} ${moodboard.likesCount === 1 ? 'apreciere' : 'aprecieri'}`
              : 'Apreciază'
            }
          </button>
        </div>

        <Link to="/" className="btn btn-primary">Explorează Nestify →</Link>
      </div>

      {/* ── Grid ── */}
      <main style={{ padding: '52px 48px 100px' }}>
        {!moodboard.items?.length ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Nu există camere în acest moodboard.</p>
          </div>
        ) : (
          <div className="interior-grid">
            {moodboard.items.map(item => (
              <Link
                key={item.id}
                to={`/styles/${item.image?.style?.slug}/interiors/${item.image?.slug}`}
                style={{ display: 'block', textDecoration: 'none', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', color: 'inherit' }}
              >
                <img
                  src={img(item.image?.imageUrl)}
                  alt={item.image?.title}
                  style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '16px 18px 20px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>
                    {item.image?.style?.title || item.image?.style?.name}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', marginBottom: 4 }}>
                    {item.image?.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.image?.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer CTA ── */}
      <div style={{ background: 'var(--cream-dark)', borderTop: '1px solid var(--card-border)', padding: '48px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', marginBottom: 8 }}>
          Îți place ce vezi?
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Creează-ți propriul moodboard pe Nestify.</p>
        <Link to="/register" className="btn btn-primary">Înregistrează-te gratuit</Link>
      </div>
    </div>
  );
}
