import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

function LocationGallery({ photos, apiImg }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ borderTop: '1px solid var(--card-border)', marginTop: 0 }}>
      <div style={{ position: 'relative', background: '#111', overflow: 'hidden' }}>
        <img src={apiImg(photos[active])} alt="" style={{ width: '100%', maxHeight: 480, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
        {photos.length > 1 && (
          <>
            <button onClick={() => setActive(p => (p - 1 + photos.length) % photos.length)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: 40, height: 40, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={() => setActive(p => (p + 1) % photos.length)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: 40, height: 40, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        )}
        <div style={{ position: 'absolute', bottom: 12, right: 16, background: 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', padding: '3px 8px' }}>{active + 1} / {photos.length}</div>
      </div>
      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', background: 'var(--cream)', borderTop: '1px solid var(--card-border)' }}>
          {photos.map((url, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer', outline: active === i ? '3px solid var(--accent)' : 'none', outlineOffset: -3 }}>
              <img src={apiImg(url)} alt="" style={{ width: 100, height: 68, objectFit: 'cover', display: 'block', opacity: active === i ? 1 : 0.55, transition: 'opacity 0.2s' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MovieHouseDetailsPage() {
  const { slug } = useParams();
  const [house,       setHouse]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [styles,      setStyles]      = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    api.get(`/api/movie-houses/${slug}`)
      .then(r => { setHouse(r.data); setActivePhoto(0); })
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get('/api/styles').then(r => setStyles(r.data)).catch(() => {});
  }, [slug]);

  if (loading) return <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>;
  if (!house) return (
    <div className="museum-home">
      <Navbar />
      <div style={{ padding: '80px 48px', textAlign: 'center' }} className="empty-state">
        <h3>Movie house negăsit</h3>
        <Link to="/movie-houses" className="btn btn-primary" style={{ marginTop: 20 }}>← Înapoi</Link>
      </div>
    </div>
  );

  const gallery = Array.isArray(house.gallery) ? house.gallery : [];
  const allPhotos = [house.imageUrl, ...gallery].filter(Boolean);
  const locations = Array.isArray(house.locations) ? house.locations : [];
  const shownStyles = styles.slice(0, 6);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      {/* ── Editorial strip ── */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '9px 48px', background: 'var(--cream)' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 300, letterSpacing: '0.14em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Only Movies in the Building — {house.kicker || 'Cinema & Interior Design'}
        </span>
      </div>

      {/* ── Hero: two-column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 520 }}>
        {/* Left: text */}
        <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--card-border)' }}>
          <Link to="/movie-houses" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--card-border)', paddingBottom: 2, display: 'inline-block', marginBottom: 40 }}>
            ← Movie Houses
          </Link>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
            {house.kicker || 'Movie House'}
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.2rem,4vw,3.6rem)', fontWeight: 500, lineHeight: 1.05, margin: '0 0 24px' }}>
            {house.title}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.85, fontWeight: 300, maxWidth: 440, marginBottom: 36 }}>
            {house.description?.slice(0, 220)}{house.description?.length > 220 ? '…' : ''}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/quiz" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--cream)', padding: '12px 24px', textDecoration: 'none' }}>
              Style Quiz →
            </Link>
            {allPhotos.length > 0 && (
              <a href="#gallery" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'transparent', color: 'var(--text)', padding: '12px 24px', textDecoration: 'none', border: '1px solid var(--card-border)' }}>
                Vezi galeria
              </a>
            )}
          </div>
        </div>

        {/* Right: cover photo */}
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          {img(house.imageUrl)
            ? <img src={img(house.imageUrl)} alt={house.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '3rem', opacity: 0.15 }}>🎬</span>
              </div>
          }
        </div>
      </div>

      {/* ── Gallery (Houzz-style) ── */}
      {allPhotos.length > 0 && (
        <section id="gallery" style={{ borderTop: '1px solid var(--card-border)' }}>
          {/* Main photo */}
          <div style={{ position: 'relative', background: '#111', overflow: 'hidden' }}>
            <img
              src={img(allPhotos[activePhoto])}
              alt=""
              style={{ width: '100%', maxHeight: 600, objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            {/* Prev / Next */}
            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhoto(p => (p - 1 + allPhotos.length) % allPhotos.length)}
                  style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: 44, height: 44, cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >‹</button>
                <button
                  onClick={() => setActivePhoto(p => (p + 1) % allPhotos.length)}
                  style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: 44, height: 44, cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >›</button>
              </>
            )}
            {/* Counter */}
            <div style={{ position: 'absolute', bottom: 16, right: 20, background: 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', padding: '4px 10px', letterSpacing: '0.08em' }}>
              {activePhoto + 1} / {allPhotos.length}
            </div>
          </div>

          {/* Thumbnails */}
          {allPhotos.length > 1 && (
            <div style={{ borderTop: '1px solid var(--card-border)', display: 'flex', gap: 0, overflowX: 'auto', background: 'var(--cream)' }}>
              {allPhotos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  style={{ flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer', outline: activePhoto === i ? '3px solid var(--accent)' : 'none', outlineOffset: -3 }}
                >
                  <img src={img(url)} alt="" style={{ width: 120, height: 80, objectFit: 'cover', display: 'block', opacity: activePhoto === i ? 1 : 0.6, transition: 'opacity 0.2s' }} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── About: two-column ── */}
      <section style={{ display: 'grid', gridTemplateColumns: house.history ? '1fr 1fr' : '1fr', gap: 0, borderTop: '1px solid var(--card-border)' }}>
        <div style={{ padding: '64px 56px', borderRight: house.history ? '1px solid var(--card-border)' : 'none' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 16 }}>Despre această casă</span>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '0.95rem', fontWeight: 300 }}>{house.description}</p>
        </div>
        {house.history && (
          <div style={{ padding: '64px 56px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 16 }}>Context cinematografic</span>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '0.95rem', fontWeight: 300 }}>{house.history}</p>
          </div>
        )}
      </section>

      {/* ── Locations ── */}
      {locations.map((loc, i) => {
        const locGallery = Array.isArray(loc.gallery) ? loc.gallery : [];
        const locPhotos = [loc.imageUrl, ...locGallery].filter(Boolean);
        return (
          <section key={loc.id} style={{ borderTop: '1px solid var(--card-border)' }}>
            {/* Location header */}
            <div style={{ padding: '48px 48px 0', display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Locație {i + 1}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
            </div>

            {/* Location hero: two-column */}
            <div style={{ display: 'grid', gridTemplateColumns: loc.imageUrl ? '1fr 1fr' : '1fr', padding: '32px 48px 48px', gap: 48, alignItems: 'start' }}>
              <div>
                {loc.kicker && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>
                    {loc.kicker}
                  </span>
                )}
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.6rem,3vw,2.6rem)', fontWeight: 500, margin: '0 0 20px', lineHeight: 1.1 }}>
                  {loc.title}
                </h2>
                {loc.description && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.85, fontWeight: 300, marginBottom: loc.history ? 24 : 0 }}>
                    {loc.description}
                  </p>
                )}
                {loc.history && (
                  <>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8, marginTop: 20 }}>Context cinematografic</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.85, fontWeight: 300 }}>
                      {loc.history}
                    </p>
                  </>
                )}
              </div>
              {loc.imageUrl && (
                <div style={{ overflow: 'hidden', borderRadius: 0 }}>
                  <img src={img(loc.imageUrl)} alt={loc.title} style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>

            {/* Location gallery */}
            {locPhotos.length > 1 && (
              <LocationGallery photos={locPhotos} apiImg={img} />
            )}
          </section>
        );
      })}

      {/* ── Recommended styles ── */}
      {shownStyles.length > 0 && (
        <section style={{ borderTop: '1px solid var(--card-border)', padding: '64px 48px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Inspirație pentru decor</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, margin: 0 }}>Stiluri care au inspirat filmul</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {shownStyles.map(s => (
              <Link key={s.id} to={`/styles/${s.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                <div style={{ height: 180, overflow: 'hidden', background: 'var(--cream-dark)' }}>
                  {img(s.imageUrl)
                    ? <img src={img(s.imageUrl)} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--beige)' }} />
                  }
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Stil</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', margin: 0 }}>{s.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <div style={{ padding: '56px 48px', background: 'var(--text)', borderTop: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', color: 'var(--cream)', marginBottom: 6 }}>
            Te-a inspirat acest film?
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(245,241,235,0.6)', fontSize: '0.88rem', fontWeight: 300 }}>
            Salvează idei în moodboard sau descoperă stiluri similare.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/moodboards" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--cream)', color: 'var(--text)', padding: '12px 24px', textDecoration: 'none' }}>
            Creează Moodboard
          </Link>
          <Link to="/movie-houses" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--cream)', padding: '12px 24px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
            ← Toate filmele
          </Link>
        </div>
      </div>
    </div>
  );
}
