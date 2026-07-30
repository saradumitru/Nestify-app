import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function MovieHousesPage() {
  const [houses,  setHouses]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/movie-houses')
      .then(r => setHouses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ padding: '72px 48px 60px', background: 'var(--cream-dark)', textAlign: 'center' }}>
        <span className="museum-kicker">Cinematografie & Design</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.4rem,5vw,4rem)', marginBottom: 16 }}>
          Only Movies in the Building
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto', lineHeight: 1.85 }}>
          Interioare iconice din lumea filmului — case care au deveni personaje. Inspiră-te din estetica lor pentru spațiul tău.
        </p>
      </div>

      <main style={{ padding: '56px 48px 100px' }}>
        {houses.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Nicio casă adăugată încă.
            </p>
          </div>
        ) : (
          <div className="museum-grid">
            {houses.map(house => (
              <Link key={house.id} to={`/movie-houses/${house.slug}`} className="museum-frame-card">
                <div className="museum-frame-inner" style={{ height: 280, overflow: 'hidden' }}>
                  {img(house.imageUrl)
                    ? <img src={img(house.imageUrl)} alt={house.title} className="museum-artwork-img" style={{ height: '100%' }} />
                    : <div style={{ height: '100%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '3rem' }}>🎬</span>
                      </div>
                  }
                </div>
                <div className="museum-card-meta">
                  <p className="museum-card-note">{house.kicker || 'Movie House'}</p>
                  <h3>{house.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {house.description?.slice(0, 90)}{house.description?.length > 90 ? '…' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
