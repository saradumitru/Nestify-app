import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Globe, Phone, Briefcase, Edit2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function DesignersPage() {
  const [designers, setDesigners] = useState([]);
  const [loading,   setLoading]   = useState(true);

  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem('user')); } catch {}

  useEffect(() => {
    api.get('/api/designers')
      .then(r => setDesigners(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '72px 48px 56px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ maxWidth: 680 }}>
          <span className="museum-kicker">Profesioniști Nestify</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.4rem,5vw,4rem)', marginBottom: 16, lineHeight: 1.05 }}>
            Designeri de Interior
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.85, maxWidth: 520 }}>
            Profesioniști care transformă spații în povești. Explorează portofoliile lor și intră în contact direct.
          </p>
        </div>
      </div>

      <main style={{ padding: '56px 48px 100px' }}>
        {designers.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              Nu există încă designeri înregistrați.
            </p>
            <Link to="/register" className="btn btn-primary">Înregistrează-te ca designer</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
            {designers.map(designer => {
              const isOwnProfile = currentUser?.id === designer.user?.id;

              return (
                <div
                  key={designer.id}
                  style={{ position: 'relative', border: '1px solid var(--card-border)', background: 'var(--card)', transition: 'box-shadow 0.2s' }}
                >
                  {isOwnProfile && (
                    <Link
                      to="/designer/profile"
                      style={{
                        position: 'absolute', top: 12, right: 12, zIndex: 2,
                        display: 'flex', alignItems: 'center', gap: 6,
                        textDecoration: 'none', background: 'rgba(255,255,255,0.92)',
                        border: '1px solid var(--card-border)', padding: '7px 10px',
                        color: 'var(--text)', fontFamily: 'Inter, sans-serif',
                        fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Edit2 size={12} strokeWidth={1.5} />
                      Editeaza
                    </Link>
                  )}

                  <Link
                    to={`/designers/${designer.id}`}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                {/* Portfolio preview strip */}
                <div style={{ height: 160, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, overflow: 'hidden' }}>
                  {[0, 1, 2].map(i => {
                    const item = designer.portfolioItems?.[i];
                    return (
                      <div key={i} style={{ background: `hsl(${28 + i * 15}, 22%, ${86 - i * 4}%)`, overflow: 'hidden' }}>
                        {item?.imageUrl && img(item.imageUrl) && (
                          <img src={img(item.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '20px 22px 22px' }}>
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      background: 'var(--cream-dark)', border: '1px solid var(--card-border)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {designer.avatarUrl && img(designer.avatarUrl)
                        ? <img src={img(designer.avatarUrl)} alt={designer.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                            {designer.user?.name?.[0]?.toUpperCase() || 'D'}
                          </span>
                      }
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', marginBottom: 2 }}>
                        {designer.user?.name}
                      </h3>
                      {designer.specialties?.length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {(designer.specialties).slice(0, 2).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {designer.bio ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {designer.bio}
                    </p>
                  ) : isOwnProfile && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
                      Completeaza profilul din contul tau pentru ca acest card sa afiseze informatii publice.
                    </p>
                  )}

                  {/* Contact icons */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {designer.portfolioItems?.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Briefcase size={12} strokeWidth={1.5} />
                        {designer.portfolioItems.length} {designer.portfolioItems.length === 1 ? 'proiect' : 'proiecte'}
                      </span>
                    )}
                    {designer.phone && <Phone size={13} strokeWidth={1.5} color="var(--text-muted)" />}
                    {designer.instagram && <Link2 size={13} strokeWidth={1.5} color="var(--text-muted)" />}
                    {designer.website && <Globe size={13} strokeWidth={1.5} color="var(--text-muted)" />}
                  </div>
                </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
