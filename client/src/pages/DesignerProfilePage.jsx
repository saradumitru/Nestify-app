import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Link2, Globe, Phone, ArrowLeft, Briefcase, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function DesignerProfilePage() {
  const { id } = useParams();
  const [designer, setDesigner] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem('user')); } catch {}

  useEffect(() => {
    api.get(`/api/designers/${id}`)
      .then(r => setDesigner(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (!activeProject) return;
      if (e.key === 'Escape') setActiveProject(null);
      if (e.key === 'ArrowRight') setActivePhotoIdx(i => Math.min(i + 1, projectPhotos(activeProject).length - 1));
      if (e.key === 'ArrowLeft') setActivePhotoIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject]);

  const projectPhotos = (item) => {
    const gallery = Array.isArray(item.gallery) ? item.gallery : [];
    return item.imageUrl ? [item.imageUrl, ...gallery] : gallery;
  };

  const openProject = (item) => {
    setActiveProject(item);
    setActivePhotoIdx(0);
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  if (!designer) return (
    <div className="museum-home">
      <Navbar />
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Designer negăsit.</p>
        <Link to="/designers" className="btn btn-primary">Înapoi la designeri</Link>
      </div>
    </div>
  );

  const specialties = Array.isArray(designer.specialties) ? designer.specialties : [];
  const isOwnProfile = currentUser?.id === designer.user?.id;

  return (
    <div className="museum-home">
      <Navbar />

      {/* Editorial strip */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '9px 48px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/designers" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          <ArrowLeft size={12} strokeWidth={1.5} />
          Toți designerii
        </Link>
      </div>

      {/* Hero */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ maxWidth: 860, display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{
            width: 110, height: 110, flexShrink: 0,
            background: 'var(--card)', border: '1px solid var(--card-border)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {designer.avatarUrl && img(designer.avatarUrl)
              ? <img src={img(designer.avatarUrl)} alt={designer.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  {designer.user?.name?.[0]?.toUpperCase() || 'D'}
                </span>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <span className="museum-kicker">Designer de interior</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3.2rem)', marginBottom: 10, lineHeight: 1.05 }}>
              {designer.user?.name}
            </h1>

            {specialties.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {specialties.map((s, i) => (
                  <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--card-border)', padding: '4px 10px' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Contact */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              {isOwnProfile && (
                <Link to="/designer/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'var(--cream)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 400, border: '1px solid var(--text)', padding: '8px 14px', background: 'var(--text)' }}>
                  <Edit2 size={13} strokeWidth={1.5} />
                  Editeaza profilul
                </Link>
              )}
              {designer.phone && (
                <a href={`tel:${designer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, border: '1px solid var(--card-border)', padding: '8px 14px', background: 'var(--white)', transition: 'background 0.15s' }}>
                  <Phone size={13} strokeWidth={1.5} />
                  {designer.phone}
                </a>
              )}
              {designer.instagram && (
                <a href={designer.instagram.startsWith('http') ? designer.instagram : `https://instagram.com/${designer.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, border: '1px solid var(--card-border)', padding: '8px 14px', background: 'var(--white)' }}>
                  <Link2 size={13} strokeWidth={1.5} />
                  Instagram
                </a>
              )}
              {designer.website && (
                <a href={designer.website.startsWith('http') ? designer.website : `https://${designer.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, border: '1px solid var(--card-border)', padding: '8px 14px', background: 'var(--white)' }}>
                  <Globe size={13} strokeWidth={1.5} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: '56px 48px 100px', maxWidth: 900, margin: '0 auto' }}>

        {/* Bio */}
        {designer.bio && (
          <section style={{ marginBottom: 56 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
              Despre
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.25rem', lineHeight: 1.75, color: 'var(--text)', fontWeight: 400 }}>
              {designer.bio}
            </p>
          </section>
        )}

        {/* Experience */}
        {designer.experience && (
          <section style={{ marginBottom: 56 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
              Experiență
            </p>
            <div style={{ paddingLeft: 20, borderLeft: '2px solid var(--card-border)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                {designer.experience}
              </p>
            </div>
          </section>
        )}

        {/* Portfolio */}
        {designer.portfolioItems?.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Portofoliu
              </p>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                {designer.portfolioItems.length} {designer.portfolioItems.length === 1 ? 'proiect' : 'proiecte'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {designer.portfolioItems.map(item => {
                const photos = projectPhotos(item);
                return (
                  <div key={item.id}
                    onClick={() => openProject(item)}
                    style={{ border: '1px solid var(--card-border)', background: 'var(--card)', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ height: 200, background: 'var(--cream-dark)', overflow: 'hidden', position: 'relative' }}>
                      {item.imageUrl && img(item.imageUrl)
                        ? <img src={img(item.imageUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Briefcase size={28} strokeWidth={1} color="var(--card-border)" />
                          </div>
                      }
                      {photos.length > 1 && (
                        <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,20,16,0.7)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 400, padding: '3px 8px', letterSpacing: '0.05em' }}>
                          {photos.length} foto
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '16px 18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem' }}>
                          {item.title}
                        </h3>
                        {item.year && (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                            {item.year}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 300 }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Project photo panel */}
      {activeProject && (() => {
        const photos = projectPhotos(activeProject);
        const current = photos[activePhotoIdx];
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}
            onClick={() => setActiveProject(null)}
          >
            <div style={{ flex: 1, background: 'rgba(26,20,16,0.55)' }} />
            <div
              style={{ width: 500, background: 'var(--white)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-4px 0 32px rgba(0,0,0,0.18)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
                <div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Proiect</span>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', margin: 0 }}>{activeProject.title}</h2>
                </div>
                <button onClick={() => setActiveProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-muted)' }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Main photo */}
              <div style={{ flex: 1, overflow: 'hidden', background: 'var(--cream-dark)', position: 'relative' }}>
                {current
                  ? <img src={img(current)} alt={activeProject.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={40} strokeWidth={1} color="var(--card-border)" /></div>
                }

                {/* Prev / Next arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      disabled={activePhotoIdx === 0}
                      onClick={() => setActivePhotoIdx(i => i - 1)}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: activePhotoIdx === 0 ? 'default' : 'pointer', padding: 8, opacity: activePhotoIdx === 0 ? 0.3 : 1 }}
                    >
                      <ChevronLeft size={18} strokeWidth={1.5} />
                    </button>
                    <button
                      disabled={activePhotoIdx === photos.length - 1}
                      onClick={() => setActivePhotoIdx(i => i + 1)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: activePhotoIdx === photos.length - 1 ? 'default' : 'pointer', padding: 8, opacity: activePhotoIdx === photos.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronRight size={18} strokeWidth={1.5} />
                    </button>
                    <span style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(26,20,16,0.6)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', padding: '3px 8px' }}>
                      {activePhotoIdx + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 6, padding: '10px 16px', overflowX: 'auto', flexShrink: 0, borderTop: '1px solid var(--card-border)', background: 'var(--cream-dark)' }}>
                  {photos.map((ph, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      style={{ width: 54, height: 54, flexShrink: 0, cursor: 'pointer', border: idx === activePhotoIdx ? '2px solid var(--text)' : '2px solid transparent', overflow: 'hidden' }}
                    >
                      <img src={img(ph)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div style={{ padding: '20px 24px', flexShrink: 0, borderTop: '1px solid var(--card-border)' }}>
                {activeProject.year && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>{activeProject.year}</span>
                )}
                {activeProject.description && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: 'var(--text)', marginTop: activeProject.year ? 8 : 0 }}>
                    {activeProject.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
