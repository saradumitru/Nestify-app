import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function RoomPage() {
  const { roomType } = useParams();
  const decodedRoom = decodeURIComponent(roomType);

  const [interiors,      setInteriors]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [styleFilter,    setStyleFilter]    = useState(null);
  const [activeInterior, setActiveInterior] = useState(null);
  const [hoveredId,      setHoveredId]      = useState(null);

  useEffect(() => {
    api.get(`/api/interiors?roomType=${encodeURIComponent(decodedRoom)}`)
      .then(r => setInteriors(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedRoom]);

  // Close panel with Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setActiveInterior(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const styles = [...new Map(interiors.map(i => [i.style?.id, i.style]).filter(([, s]) => s)).values()];
  const filtered = styleFilter ? interiors.filter(i => i.style?.id === styleFilter) : interiors;

  // Similar: same style as active, excluding active itself
  const similar = activeInterior
    ? interiors.filter(i => i.id !== activeInterior.id && i.style?.id === activeInterior.style?.id).slice(0, 8)
    : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      {/* Editorial strip */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '9px 48px', background: 'var(--cream)' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 300, letterSpacing: '0.14em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Vol. II — Caută după cameră
        </span>
      </div>

      {/* Header */}
      <div style={{ padding: '64px 48px 40px', borderBottom: '1px solid var(--card-border)' }}>
        <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--card-border)', paddingBottom: 2, display: 'inline-block', marginBottom: 32 }}>
          ← Acasă
        </Link>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Cameră</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 500, lineHeight: 1, margin: '0 0 16px' }}>
          {decodedRoom}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.85, fontWeight: 300 }}>
          {filtered.length} {filtered.length === 1 ? 'interior' : 'interioare'} găsite
          {styleFilter && styles.find(s => s.id === styleFilter) ? ` în stilul ${styles.find(s => s.id === styleFilter).title}` : ''}
        </p>
      </div>

      {/* Style filter chips */}
      {styles.length > 1 && (
        <div style={{ padding: '16px 48px', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 4 }}>Stil:</span>
          <button
            onClick={() => setStyleFilter(null)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', padding: '5px 14px', border: '1px solid var(--card-border)', background: styleFilter === null ? 'var(--text)' : 'transparent', color: styleFilter === null ? 'var(--cream)' : 'var(--text-muted)', cursor: 'pointer', letterSpacing: '0.08em' }}
          >
            Toate
          </button>
          {styles.map(s => (
            <button
              key={s.id}
              onClick={() => setStyleFilter(s.id)}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', padding: '5px 14px', border: '1px solid var(--card-border)', background: styleFilter === s.id ? 'var(--text)' : 'transparent', color: styleFilter === s.id ? 'var(--cream)' : 'var(--text-muted)', cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Photo grid */}
      <div style={{ padding: '48px 48px 100px' }}>
        {loading ? (
          <div className="loading-spinner" />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', color: 'var(--text-muted)' }}>
              Niciun interior adăugat pentru această cameră.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Interioarele apar după ce sunt etichetate cu tipul de cameră în admin.
            </p>
          </div>
        ) : (
          <div style={{ columns: '3 260px', gap: 12 }}>
            {filtered.map(interior => (
              <div
                key={interior.id}
                style={{ breakInside: 'avoid', marginBottom: 12, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                onMouseEnter={() => setHoveredId(interior.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setActiveInterior(interior)}
              >
                {interior.imageUrl ? (
                  <img
                    src={img(interior.imageUrl)}
                    alt={interior.title}
                    style={{ width: '100%', display: 'block', transition: 'transform 0.4s', transform: hoveredId === interior.id ? 'scale(1.03)' : 'scale(1)' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: 220, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ opacity: 0.3, fontSize: '2rem' }}>🛋️</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '40px 14px 14px',
                  background: 'linear-gradient(transparent, rgba(20,16,12,0.68))',
                  opacity: hoveredId === interior.id ? 1 : 0,
                  transition: 'opacity 0.25s',
                  pointerEvents: 'none',
                }}>
                  {interior.style && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>
                      {interior.style.title}
                    </p>
                  )}
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', color: '#fff', margin: 0, lineHeight: 1.2 }}>
                    {interior.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Side panel ── */}
      {activeInterior && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}
          onClick={() => setActiveInterior(null)}
        >
          {/* Backdrop */}
          <div style={{ flex: 1, background: 'rgba(26,20,16,0.45)' }} />

          {/* Panel */}
          <div
            style={{ width: 460, maxWidth: '92vw', background: 'var(--cream)', overflowY: 'auto', boxShadow: '-4px 0 32px rgba(0,0,0,0.16)', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div style={{ borderBottom: '1px solid var(--card-border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--cream)', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeInterior.style && (
                  <Link
                    to={`/styles/${activeInterior.style.slug}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', border: '1px solid var(--card-border)', padding: '3px 10px' }}
                  >
                    {activeInterior.style.title}
                  </Link>
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--card-border)', padding: '3px 10px' }}>
                  {decodedRoom}
                </span>
              </div>
              <button onClick={() => setActiveInterior(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            {/* Big photo */}
            {activeInterior.imageUrl && (
              <img
                src={img(activeInterior.imageUrl)}
                alt={activeInterior.title}
                style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'cover' }}
              />
            )}

            {/* Info */}
            <div style={{ padding: '20px 22px 24px' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, margin: '0 0 6px', lineHeight: 1.2 }}>
                {activeInterior.title}
              </h2>
              {activeInterior.subtitle && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: 10 }}>
                  {activeInterior.subtitle}
                </p>
              )}
              {activeInterior.description && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
                  {activeInterior.description}
                </p>
              )}

              <Link
                to={`/styles/${activeInterior.style?.slug}/interiors/${activeInterior.slug}`}
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--text)', paddingBottom: 2 }}
              >
                Deschide pagina completă →
              </Link>
            </div>

            {/* Similar ideas */}
            {similar.length > 0 && (
              <div style={{ borderTop: '1px solid var(--card-border)', padding: '20px 22px 28px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                  Idei similare — {activeInterior.style?.title}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {similar.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setActiveInterior(s)}
                      style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                    >
                      {s.imageUrl
                        ? <img src={img(s.imageUrl)} alt={s.title} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        : <div style={{ width: '100%', height: 110, background: 'var(--cream-dark)' }} />
                      }
                      <div style={{ padding: '7px 2px 2px' }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.88rem', margin: 0, lineHeight: 1.2, color: 'var(--text)' }}>{s.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
