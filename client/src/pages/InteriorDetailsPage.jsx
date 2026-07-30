import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

function InteriorDetailsPage() {
  const { styleSlug, interiorSlug } = useParams();
  const navigate = useNavigate();

  const [interior,    setInterior]    = useState(null);
  const [similar,     setSimilar]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [moodboards,  setMoodboards]  = useState([]);
  const [selBoard,    setSelBoard]    = useState('');
  const [addMsg,      setAddMsg]      = useState('');
  const [adding,      setAdding]      = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [interiorGalleryFavoriteIds, setInteriorGalleryFavoriteIds] = useState([]);
  const [moodModal,   setMoodModal]   = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setActivePhoto(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch {}

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/interiors/${interiorSlug}`);
        setInterior(res.data);
        /* fetch similar interiors from same style */
        if (res.data?.style?.slug) {
          try {
            const simRes = await api.get(`/api/search?q=${encodeURIComponent(res.data.style.title || '')}`);
            const others = (simRes.data.interiors || []).filter(i => i.slug !== interiorSlug).slice(0, 6);
            setSimilar(others);
          } catch {}
        }
      } catch { /* handled below */ }
      setLoading(false);
    };
    load();
  }, [interiorSlug]);

  useEffect(() => {
    if (!token) return;
    api.get('/api/moodboards').then(r => { setMoodboards(r.data); setSelBoard(r.data[0]?.id ? String(r.data[0].id) : ''); }).catch(() => {});
    api.get('/api/favorites').then(r => {
      setFavoriteIds(r.data.map(f => f.imageId).filter(Boolean));
      setInteriorGalleryFavoriteIds(r.data.map(f => f.interiorGalleryPhotoId).filter(Boolean));
    }).catch(() => {});
  }, [token]);

  const handleAddToMoodboard = async () => {
    if (!token) { toast.error('Autentifică-te pentru a folosi moodboard-urile.'); return; }
    if (!selBoard) { setAddMsg('Alege un moodboard mai întâi.'); return; }
    setAdding(true); setAddMsg('');
    try {
      await api.post(`/api/moodboards/${selBoard}/items`, { imageId: interior.id });
      const board = moodboards.find(b => String(b.id) === selBoard);
      setAddMsg(`Adăugat în „${board?.title || 'moodboard'}"!`);
      toast.success('Adăugat în moodboard!');
    } catch (err) {
      if (err?.response?.status === 409) setAddMsg('Deja există în acest moodboard.');
      else setAddMsg('Eroare la adăugare.');
    }
    setAdding(false);
  };

  const handleToggleFavorite = async () => {
    if (!token) { navigate('/login'); return; }
    const wasFav = favoriteIds.includes(interior.id);
    setFavoriteIds(p => wasFav ? p.filter(id => id !== interior.id) : [...p, interior.id]);
    try {
      await api.post('/api/favorites', { imageId: interior.id });
      if (!wasFav) { toast.success('Adăugat la favorite!'); setMoodModal(true); }
      else toast.success('Eliminat din favorite');
    } catch { setFavoriteIds(p => wasFav ? [...p, interior.id] : p.filter(id => id !== interior.id)); }
  };

  const handleToggleGalleryFavorite = async (photoId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!token) { navigate('/login'); return; }
    const wasFav = interiorGalleryFavoriteIds.includes(photoId);
    setInteriorGalleryFavoriteIds(p => wasFav ? p.filter(id => id !== photoId) : [...p, photoId]);
    try {
      await api.post('/api/favorites', { interiorGalleryPhotoId: photoId });
      toast.success(wasFav ? 'Eliminat din favorite' : 'Adăugat la favorite!');
    } catch {
      setInteriorGalleryFavoriteIds(p => wasFav ? [...p, photoId] : p.filter(id => id !== photoId));
      toast.error('Eroare la actualizarea favoritei.');
    }
  };

  const handleAddFavToMoodboard = async () => {
    if (!selBoard) return;
    try { await api.post(`/api/moodboards/${selBoard}/items`, { imageId: interior.id }); toast.success('Adăugat în moodboard!'); }
    catch (err) { if (err?.response?.status === 409) toast.success('Deja în moodboard!'); else toast.error('Eroare'); }
    setMoodModal(false);
  };

  const isFav = favoriteIds.includes(interior?.id);
  const otherRooms = interior?.style?.images?.filter(r => r.slug !== interior.slug) || [];

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  if (!interior) return (
    <div className="museum-home">
      <Navbar />
      <main style={{ padding: '80px 48px' }}>
        <div className="empty-state">
          <h3>Interiorul nu a fost găsit</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Înapoi acasă</Link>
        </div>
      </main>
    </div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <header
        className="style-page-hero"
        style={{ backgroundImage: `url(${img(interior.imageUrl)})` }}
      >
        <div className="style-page-hero-copy">
          <span className="museum-kicker">{interior.style?.title || 'Interior'}</span>
          <h1>{interior.title}</h1>
          <p className="style-hero-description">{interior.subtitle || interior.description}</p>
          <div className="style-hero-actions">
            <button
              type="button"
              className={`favorite-toggle${isFav ? ' saved' : ''}`}
              onClick={handleToggleFavorite}
            >{isFav ? '♥ Salvat' : '♡ Salvează'}</button>
            <Link to={`/styles/${interior.style?.slug}`} className="museum-button ghost">← Stilul {interior.style?.title}</Link>
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="interior-content style-main">

        {/* Left: description + similar rooms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Description */}
          <div className="interior-copy">
            <h2>Despre cameră</h2>
            <p>{interior.description || 'O cameră emblematică pentru acest stil.'}</p>
            {interior.style && (
              <p>Acest interior aparține stilului <Link to={`/styles/${interior.style.slug}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{interior.style.title}</Link> și prezintă materiale și obiecte atent alese.</p>
            )}
          </div>

          {/* Clickable gallery */}
          {interior.galleryPhotos?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.7rem', marginBottom: 10 }}>Mai multe fotografii</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>
                Apasă pe o fotografie pentru mai multe detalii și obiectele din imagine.
              </p>
              <div style={{ columns: '2 200px', gap: 10 }}>
                {interior.galleryPhotos.map((photo) => {
                  const isGalleryFav = interiorGalleryFavoriteIds.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setActivePhoto(photo)}
                      style={{ breakInside: 'avoid', marginBottom: 10, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <img
                        src={img(photo.imageUrl)} alt={photo.caption || ''}
                        style={{ width: '100%', display: 'block', transition: 'transform 0.35s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <button
                        className={`museum-heart-button${isGalleryFav ? ' saved' : ''}`}
                        title={isGalleryFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                        onClick={(e) => handleToggleGalleryFavorite(photo.id, e)}
                      >{isGalleryFav ? '♥' : '♡'}</button>
                      {photo.objects?.length > 0 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,20,16,0.78)', color: '#f5f1eb', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', padding: '3px 9px', letterSpacing: '0.08em' }}>
                          {photo.objects.length} {photo.objects.length === 1 ? 'obiect' : 'obiecte'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legacy objects (kept for backward compat, shown only if no gallery photos) */}
          {interior.objects?.length > 0 && !interior.galleryPhotos?.length && (
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.7rem', marginBottom: 24 }}>Obiecte identificate</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.8 }}>
                Descoperă piesele de mobilier și decorațiuni din această cameră.
              </p>
              <div style={{ display: 'grid', gap: 18 }}>
                {interior.objects.map((obj) => (
                  <div key={obj.id} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 22, display: 'flex', gap: 18 }}>
                    {obj.imageUrl && (
                      <img src={img(obj.imageUrl)} alt={obj.name} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', marginBottom: 6 }}>{obj.name}</h4>
                      {obj.description && <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>{obj.description}</p>}
                      {obj.shopLink && (
                        <a href={obj.shopLink} target="_blank" rel="noreferrer" className="shop-link" style={{ display: 'inline-flex', marginBottom: obj.productLinks?.length ? 10 : 0 }}>
                          🛒 Vezi produs →
                        </a>
                      )}
                      {obj.productLinks?.length > 0 && (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {obj.productLinks.map(link => (
                            <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="product-link-item">
                              <span>{link.title}{link.store ? ` · ${link.store}` : ''}</span>
                              {link.price && <span style={{ color: 'var(--brown-md)', fontWeight: 700 }}>{link.price}</span>}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar interiors from same style */}
          {otherRooms.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.7rem', marginBottom: 8 }}>Alte camere în același stil</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.8 }}>Explorează cum se aplică acest stil în alte spații.</p>
              <div className="related-grid">
                {otherRooms.slice(0, 4).map(room => (
                  <Link key={room.id} to={`/styles/${interior.style?.slug}/interiors/${room.slug}`} className="related-card">
                    <img src={img(room.imageUrl)} alt={room.title} />
                    <div><h4>{room.title}</h4><p>{room.subtitle}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar interiors from search */}
          {similar.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.7rem', marginBottom: 8 }}>Camere similare</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.8 }}>Inspirații dintr-un stil înrudit.</p>
              <div className="related-grid">
                {similar.slice(0, 4).map(room => (
                  <Link key={room.id} to={`/styles/${room.style?.slug}/interiors/${room.slug}`} className="related-card">
                    <img src={img(room.imageUrl)} alt={room.title} />
                    <div><h4>{room.title}</h4><p>{room.style?.title}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="interior-sidebar">

          {/* Style info */}
          {interior.style && (
            <div className="style-panel-card">
              <h3>Stilul: {interior.style.title}</h3>
              {(Array.isArray(interior.style.colors) ? interior.style.colors : []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 8 }}>Culori</p>
                  <div className="badge-list">
                    {(Array.isArray(interior.style.colors) ? interior.style.colors : []).map(c => (
                      <span key={c} className="badge">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {(Array.isArray(interior.style.materials) ? interior.style.materials : []).length > 0 && (
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 8 }}>Materiale</p>
                  <div className="badge-list">
                    {(Array.isArray(interior.style.materials) ? interior.style.materials : []).map(m => (
                      <span key={m} className="badge">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <Link to={`/styles/${interior.style.slug}`} className="museum-link" style={{ display: 'inline-flex', marginTop: 16, fontSize: '0.9rem' }}>
                Explorează stilul →
              </Link>
            </div>
          )}

          {/* Moodboard card */}
          <div className="style-panel-card">
            <h3>Adaugă în Moodboard</h3>
            {!token ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Link to="/login" className="auth-link">Autentifică-te</Link> pentru a folosi moodboard-urile.
              </p>
            ) : moodboards.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Nu ai moodboard-uri. <Link to="/moodboards" className="auth-link">Creează unul →</Link>
              </p>
            ) : (
              <>
                <div className="moodboard-add-row">
                  <select className="moodboard-select" value={selBoard} onChange={e => { setSelBoard(e.target.value); setAddMsg(''); }}>
                    {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <button className="btn btn-accent btn-sm" onClick={handleAddToMoodboard} disabled={adding}>
                    {adding ? '…' : '+'}
                  </button>
                </div>
                {addMsg && <p className="moodboard-msg">{addMsg}</p>}
                <Link to="/moodboards" className="museum-link" style={{ fontSize: '0.84rem', marginTop: 12, display: 'inline-flex' }}>Gestionează moodboards →</Link>
              </>
            )}
          </div>

          {/* Gallery hint card */}
          {interior.galleryPhotos?.length > 0 && (
            <div className="style-panel-card" style={{ background: 'var(--cream-dark)', border: 'none', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', marginBottom: 8, lineHeight: 1.5 }}>
                Îți place acest decor?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 0 }}>
                Apasă pe o fotografie din galerie pentru a vedea mai multe detalii și obiectele folosite în amenajare.
              </p>
            </div>
          )}

          {/* Quiz CTA */}
          <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
              Îți place acest stil? Fă quiz-ul pentru a-ți descoperi stilul perfect.
            </p>
            <Link to="/quiz" className="btn btn-primary btn-sm">Style Quiz →</Link>
          </div>
        </aside>
      </div>

      {/* ── Gallery photo detail panel ── */}
      {activePhoto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }} onClick={() => setActivePhoto(null)}>
          <div style={{ flex: 1, background: 'rgba(26,20,16,0.5)' }} />
          <div
            style={{ width: 440, maxWidth: '92vw', background: 'var(--cream)', overflowY: 'auto', boxShadow: '-4px 0 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--card-border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--cream)', zIndex: 1 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {interior.title}
              </span>
              <button onClick={() => setActivePhoto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            {/* Photo */}
            <img src={img(activePhoto.imageUrl)} alt={activePhoto.caption || ''} style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }} />

            {/* Caption */}
            {activePhoto.caption && (
              <div style={{ padding: '14px 20px 0' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>{activePhoto.caption}</p>
              </div>
            )}

            {/* Objects */}
            <div style={{ padding: '20px', flex: 1 }}>
              {activePhoto.objects?.length > 0 ? (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Obiecte din fotografie
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activePhoto.objects.map(obj => (
                      <div key={obj.id} style={{ border: '1px solid var(--card-border)', background: 'var(--white)', padding: '14px 16px' }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, marginBottom: 4 }}>{obj.name}</p>
                        {obj.description && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 8 }}>{obj.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          {obj.price && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{obj.price}</span>}
                          {obj.shopLink && (
                            <a href={obj.shopLink} target="_blank" rel="noopener noreferrer"
                              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--text)', paddingBottom: 1 }}>
                              Cumpără →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.75, fontStyle: 'italic' }}>
                  Nu au fost adăugate obiecte pentru această fotografie.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Auto moodboard modal after favorite ── */}
      {moodModal && user && moodboards.length > 0 && (
        <div className="modal-overlay" onClick={() => setMoodModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Adaugă în Moodboard</h2>
            <p>Imaginea a fost salvată la favorite. Vrei să o adaugi și într-un moodboard?</p>
            <select className="moodboard-select" value={selBoard} onChange={e => setSelBoard(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
              {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddFavToMoodboard}>Adaugă</button>
              <button className="btn btn-ghost" onClick={() => setMoodModal(false)}>Nu acum</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteriorDetailsPage;
