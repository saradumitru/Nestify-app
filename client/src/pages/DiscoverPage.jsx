import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function DiscoverPage() {
  const [boards,  setBoards]  = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/moodboards/discover')
      .then(r => setBoards(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;

    setBoards(prev => prev.map(b =>
      b.id === boardId
        ? { ...b, likedByMe: !b.likedByMe, likesCount: b.likedByMe ? (b.likesCount || 1) - 1 : (b.likesCount || 0) + 1 }
        : b
    ));

    try {
      const res = await api.post(`/api/moodboards/${boardId}/like`);
      setBoards(prev => prev.map(b =>
        b.id === boardId ? { ...b, likedByMe: res.data.liked, likesCount: res.data.likesCount } : b
      ));
    } catch {
      setBoards(prev => prev.map(b =>
        b.id === boardId
          ? { ...b, likedByMe: !b.likedByMe, likesCount: b.likedByMe ? (b.likesCount || 1) - 1 : (b.likesCount || 0) + 1 }
          : b
      ));
    }
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      <div style={{ padding: '72px 48px 56px', background: 'var(--cream-dark)', textAlign: 'center' }}>
        <span className="museum-kicker">Comunitate Nestify</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.4rem,5vw,4rem)', marginBottom: 16 }}>
          Descoperă Moodboards
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto', lineHeight: 1.85 }}>
          Explorează colecții de inspirație create de comunitatea Nestify. Fiecare moodboard spune o poveste de design.
        </p>
      </div>

      <main style={{ padding: '56px 48px 100px' }}>
        {boards.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              Nimeni nu a partajat moodboards încă. Fii primul!
            </p>
            <Link to="/moodboards" className="btn btn-primary">Creează și partajează →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
            {boards.map(board => {
              const previews = board.items?.slice(0, 4) || [];
              return (
                <Link
                  key={board.id}
                  to={`/moodboards/public/${board.shareId}`}
                  style={{ display: 'block', textDecoration: 'none', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', color: 'inherit', transition: 'box-shadow 0.2s' }}
                >
                  {/* 2x2 preview grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 200, gap: 2 }}>
                    {[0, 1, 2, 3].map(i => {
                      const item = previews[i];
                      return (
                        <div key={i} style={{ background: 'var(--cream-dark)', overflow: 'hidden' }}>
                          {item && img(item.image?.imageUrl)
                            ? <img src={img(item.image.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : <div style={{ width: '100%', height: '100%', background: `hsl(${30 + i * 20}, 25%, ${88 - i * 3}%)` }} />
                          }
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ padding: '18px 20px 16px' }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', marginBottom: 10 }}>
                      {board.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {board.items?.length || 0} {board.items?.length === 1 ? 'cameră' : 'camere'}
                        </span>
                        {board.views > 0 && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={12} strokeWidth={1.5} />
                            {board.views}
                          </span>
                        )}
                      </div>

                      {/* Like button */}
                      <button
                        onClick={e => handleLike(e, board.id)}
                        title={token ? (board.likedByMe ? 'Elimină like' : 'Adaugă like') : 'Autentifică-te pentru a da like'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: 'none', border: 'none', cursor: token ? 'pointer' : 'default',
                          padding: '4px 0', color: board.likedByMe ? '#c0392b' : 'var(--text-muted)',
                          fontSize: '0.82rem', transition: 'color 0.15s',
                        }}
                      >
                        <Heart
                          size={15}
                          strokeWidth={1.5}
                          fill={board.likedByMe ? 'currentColor' : 'none'}
                        />
                        {(board.likesCount || 0) > 0 && (
                          <span>{board.likesCount}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
