import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { stylesData } from '../data/content';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const getStyleContentEntry = (style) => {
  const slugMatch = stylesData[style.slug];
  if (slugMatch) return slugMatch;

  return Object.values(stylesData).find(item => normalize(item.title) === normalize(style.title || style.name));
};

const getShoppingSearchUrl = (query) =>
  `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;

const buildFallbackProducts = (style, materials) => {
  const title = style.title || style.name || 'acest stil';
  const material = materials[0] || 'material natural';
  return [
    {
      name: `Canapea potrivită pentru ${title}`,
      shop: 'Cauta model similar',
      roomTitle: 'Living',
      url: getShoppingSearchUrl(`canapea ${title}`),
    },
    {
      name: `Corp de iluminat ${title}`,
      shop: 'Cauta model similar',
      roomTitle: 'Iluminat',
      url: getShoppingSearchUrl(`corp de iluminat ${title}`),
    },
    {
      name: `Măsuță din ${material}`,
      shop: 'Cauta model similar',
      roomTitle: 'Mobilier accent',
      url: getShoppingSearchUrl(`masuta ${material} ${title}`),
    },
  ];
};

const getStyleProducts = (style, materials) => {
  const entry = getStyleContentEntry(style);
  const products = entry?.interiors
    ?.flatMap(interior =>
      (interior.objects || []).map(object => ({
        ...object,
        roomTitle: interior.title,
        roomSubtitle: interior.subtitle,
        url: object.url || object.shopLink || null,
      }))
    )
    .slice(0, 6);

  return products?.length ? products : buildFallbackProducts(style, materials);
};

export default function StyleDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [style,        setStyle]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [favoriteIds,  setFavoriteIds]  = useState([]);
  const [styleGalleryFavoriteIds, setStyleGalleryFavoriteIds] = useState([]);
  const [moodboards,   setMoodboards]   = useState([]);
  const [selMoodboard, setSelMoodboard] = useState({});
  const [moodMsgs,     setMoodMsgs]     = useState({});
  const [recommendations, setRecs]     = useState([]);
  const [moodModal,    setMoodModal]    = useState(null);
  const [selBoard,     setSelBoard]     = useState('');
  const [galleryPhoto, setGalleryPhoto] = useState(null);

  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch { user = null; }

  useEffect(() => {
    api.get(`/api/styles/${slug}`)
      .then(r => setStyle(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get(`/api/styles/recommendations/${slug}`)
      .then(r => setRecs(r.data))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/api/favorites').then(r => {
      setFavoriteIds(r.data.map(f => f.imageId).filter(Boolean));
      setStyleGalleryFavoriteIds(r.data.map(f => f.styleGalleryPhotoId).filter(Boolean));
    }).catch(() => {});
    api.get('/api/moodboards').then(r => {
      setMoodboards(r.data);
      setSelBoard(r.data[0]?.id ? String(r.data[0].id) : '');
    }).catch(() => {});
  }, []);

  const handleToggleFavorite = async (imageId) => {
    if (!user) { navigate('/login'); return; }
    const was = favoriteIds.includes(imageId);
    setFavoriteIds(p => was ? p.filter(id => id !== imageId) : [...p, imageId]);
    try {
      await api.post('/api/favorites', { imageId });
      if (!was) { toast.success('Adăugat la favorite!'); setMoodModal(imageId); }
      else toast.success('Eliminat din favorite');
    } catch { setFavoriteIds(p => was ? [...p, imageId] : p.filter(id => id !== imageId)); }
  };

  const handleToggleStyleGalleryFavorite = async (photoId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const was = styleGalleryFavoriteIds.includes(photoId);
    setStyleGalleryFavoriteIds(p => was ? p.filter(id => id !== photoId) : [...p, photoId]);
    try {
      await api.post('/api/favorites', { styleGalleryPhotoId: photoId });
      toast.success(was ? 'Eliminat din favorite' : 'Adăugat la favorite!');
    } catch {
      setStyleGalleryFavoriteIds(p => was ? [...p, photoId] : p.filter(id => id !== photoId));
      toast.error('Eroare la actualizarea favoritei.');
    }
  };

  const handleAddToMoodboard = async (imageId) => {
    if (!user) { toast.error('Autentifică-te mai întâi.'); return; }
    const boardId = selMoodboard[imageId] || selBoard || (moodboards[0]?.id ? String(moodboards[0].id) : '');
    if (!boardId) { setMoodMsgs(p => ({ ...p, [imageId]: 'Alege un moodboard.' })); return; }
    try {
      await api.post(`/api/moodboards/${boardId}/items`, { imageId });
      const board = moodboards.find(b => String(b.id) === String(boardId));
      setMoodMsgs(p => ({ ...p, [imageId]: `Adăugat în „${board?.title || 'moodboard'}"!` }));
      toast.success('Adăugat în moodboard!');
    } catch (err) {
      if (err?.response?.status === 409) setMoodMsgs(p => ({ ...p, [imageId]: 'Deja în moodboard.' }));
      else setMoodMsgs(p => ({ ...p, [imageId]: 'Eroare la adăugare.' }));
    }
  };

  const handleFavToMoodboard = async () => {
    if (!selBoard || !moodModal) return;
    try { await api.post(`/api/moodboards/${selBoard}/items`, { imageId: moodModal }); toast.success('Adăugat în moodboard!'); }
    catch (err) { if (err?.response?.status === 409) toast.success('Deja în moodboard!'); else toast.error('Eroare'); }
    setMoodModal(null);
  };

  if (loading) return (<div className="museum-home"><Navbar /><div className="loading-spinner" /></div>);
  if (!style) return (
    <div className="museum-home">
      <Navbar />
      <div style={{ padding: '80px 48px' }} className="empty-state">
        <h3>Stilul nu a fost găsit</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Înapoi acasă</Link>
      </div>
    </div>
  );

  const colors         = Array.isArray(style.colors)         ? style.colors         : (style.colors         ? Object.values(style.colors)         : []);
  const materials      = Array.isArray(style.materials)      ? style.materials      : (style.materials      ? Object.values(style.materials)      : []);
  const primaryImg = img(style.imageUrl) || img(style.images?.[0]?.imageUrl);
  const styleProducts = getStyleProducts(style, materials);

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <header
        className="style-page-hero"
        style={{ backgroundImage: `url(${primaryImg})` }}
      >
        <div className="style-page-hero-copy">
          <span className="museum-kicker">{style.category?.name || 'Stil interior'}</span>
          <h1>{style.title || style.name}</h1>
          <p className="style-hero-description">{style.kicker || style.description?.slice(0, 180)}</p>
          <div className="style-hero-actions">
            <Link to="/" className="museum-button ghost">← Acasă</Link>
            <Link to="/quiz" className="museum-button">Style Quiz →</Link>
          </div>
        </div>
      </header>

      {/* ── Overview ── */}
      <section className="style-main" style={{ paddingBottom: 0 }}>
        <div className="style-overview section-block" style={{ marginBottom: 28 }}>
          <div className="style-overview-copy">
            <h2>Despre acest stil</h2>
            <p>{style.description}</p>
            <div className="style-info-grid">
              {style.period && (
                <div><strong>Perioadă</strong><p>{style.period}</p></div>
              )}
              {style.history && (
                <div><strong>Influențe</strong><p>{style.history}</p></div>
              )}
              {style.audience && (
                <div><strong>Cui i se potrivește</strong><p>{style.audience}</p></div>
              )}
            </div>
          </div>

          <aside className="style-overview-panel">
            {colors.length > 0 && (
              <div className="style-panel-card">
                <h3> Paletă de culori</h3>
                <div className="badge-list">
                  {colors.map(c => <span key={c} className="badge">{c}</span>)}
                </div>
              </div>
            )}
            {materials.length > 0 && (
              <div className="style-panel-card">
                <h3> Materiale</h3>
                <div className="badge-list">
                  {materials.map(m => <span key={m} className="badge">{m}</span>)}
                </div>
              </div>
            )}
            <div className="style-panel-card">
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 10 }}>
                Îți place acest stil?
              </p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 16 }}>
                Un designer de interior îți poate transforma casa în stilul tău preferat.
              </p>
              <Link to="/designers" className="btn btn-primary btn-sm" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Contactează un designer →
              </Link>
            </div>
            <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: '22px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
                Îți place acest stil? Fă quiz-ul pentru recomandări personalizate.
              </p>
              <Link to="/quiz" className="btn btn-primary btn-sm">Style Quiz →</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Interiors + optional gallery ── */}
      {(style.images?.length > 0 || style.galleryPhotos?.length > 0 || (Array.isArray(style.gallery) && style.gallery.length > 0)) && (() => {
        const allInteriors = style.images || [];

        const InteriorCard = ({ interior }) => {
          const isFav = favoriteIds.includes(interior.id);
          return (
            <article style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
              <Link to={`/styles/${slug}/interiors/${interior.slug}`} className="interior-card-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <img src={img(interior.imageUrl)} alt={interior.title} style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
                <div className="interior-card-body">
                  {interior.roomType && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      {interior.roomType}
                    </p>
                  )}
                  <h3>{interior.title}</h3>
                  <p>{interior.subtitle}</p>
                </div>
              </Link>
              <button
                className={`museum-heart-button${isFav ? ' saved' : ''}`}
                onClick={() => handleToggleFavorite(interior.id)}
              >{isFav ? '♥' : '♡'}</button>
              {user && moodboards.length > 0 && (
                <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--cream-dark)', marginTop: 4, paddingTop: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                    <select
                      className="moodboard-select"
                      value={selMoodboard[interior.id] || selBoard || (moodboards[0]?.id ? String(moodboards[0].id) : '')}
                      onChange={e => setSelMoodboard(p => ({ ...p, [interior.id]: e.target.value }))}
                    >
                      {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                    <button className="btn btn-accent btn-sm" onClick={() => handleAddToMoodboard(interior.id)}>+</button>
                  </div>
                  {moodMsgs[interior.id] && <p className="moodboard-msg">{moodMsgs[interior.id]}</p>}
                </div>
              )}
            </article>
          );
        };

        const hasGallery = style.galleryPhotos?.length > 0 || (Array.isArray(style.gallery) && style.gallery.length > 0);

        return (
          <section style={{ padding: '0 48px 52px' }}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', marginBottom: 8 }}>Interioare</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>Explorează camerele ce folosesc acest stil, organizate pe tipuri de încăpere.</p>
            </div>

            {/* Optional gallery photos — only if admin added them */}
            {hasGallery && (
              <div style={{ marginBottom: 52 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Fotografii de stil
                  </span>
                  {style.galleryPhotos?.length > 0 && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 300, fontStyle: 'italic' }}>
                      Apasă pe o fotografie pentru a vedea obiectele din imagine
                    </span>
                  )}
                </div>
                <div style={{ columns: '3 240px', gap: '12px' }}>
                  {style.galleryPhotos?.map(photo => {
                    const isGalleryFav = styleGalleryFavoriteIds.includes(photo.id);
                    return (
                      <div
                        key={`gp-${photo.id}`}
                        style={{ breakInside: 'avoid', marginBottom: '12px', position: 'relative', cursor: 'pointer' }}
                        onClick={() => setGalleryPhoto(photo)}
                      >
                        <img
                          src={img(photo.imageUrl)}
                          alt={photo.caption || ''}
                          style={{ width: '100%', display: 'block' }}
                        />
                        <button
                          className={`museum-heart-button${isGalleryFav ? ' saved' : ''}`}
                          title={isGalleryFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                          onClick={(e) => handleToggleStyleGalleryFavorite(photo.id, e)}
                        >{isGalleryFav ? '♥' : '♡'}</button>
                        {photo.objects?.length > 0 && (
                          <div style={{
                            position: 'absolute', bottom: 10, right: 10,
                            background: 'rgba(26,20,16,0.82)', color: '#f5f1eb',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 400,
                            padding: '4px 10px', letterSpacing: '0.08em',
                          }}>
                            {photo.objects.length} {photo.objects.length === 1 ? 'obiect' : 'obiecte'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Array.isArray(style.gallery) && style.gallery.map((url, i) => (
                    <div key={`lg-${i}`} style={{ breakInside: 'avoid', marginBottom: '12px' }}>
                      <img src={img(url)} alt="" style={{ width: '100%', display: 'block' }} />
                    </div>
                  ))}
                </div>
                {style.images?.length > 0 && (
                  <div style={{ borderBottom: '1px solid var(--card-border)', marginTop: 48 }} />
                )}
              </div>
            )}

            {allInteriors.length > 0 && (
              <div className="interior-grid" style={{ padding: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 360px))', justifyContent: 'start' }}>
                {allInteriors.map(interior => <InteriorCard key={interior.id} interior={interior} />)}
              </div>
            )}
          </section>
        );
      })()}

      {/* ── Product recommendations from content catalog ── */}
      {styleProducts.length > 0 && (
        <section style={{ padding: '0 48px 70px' }}>
          <div style={{ marginBottom: 28 }}>
            <span className="museum-kicker">Shop the style</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', marginBottom: 8 }}>
              Obiecte care se potrivesc cu {style.title || style.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 640 }}>
              Recomandări de mobilier, iluminat și decor care pot completa atmosfera acestui stil.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {styleProducts.map((product) => {
              const Wrapper = product.url ? 'a' : 'div';
              return (
                <Wrapper
                  key={`${product.roomTitle}-${product.name}-full`}
                  {...(product.url ? { href: product.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: 'var(--white)', border: '1px solid var(--card-border)', padding: '18px 20px', cursor: product.url ? 'pointer' : 'default' }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {product.roomTitle || 'Recomandare'}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.18rem', marginBottom: 8 }}>
                    {product.name}
                  </h3>
                  {product.roomSubtitle && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                      {product.roomSubtitle}
                    </p>
                  )}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: product.url ? 'var(--brown)' : 'var(--text-muted)', borderBottom: product.url ? '1px solid currentColor' : 'none', paddingBottom: product.url ? 2 : 0 }}>
                    {product.url ? `${product.shop || 'Vezi produs'} →` : product.shop || 'Model similar'}
                  </span>
                </Wrapper>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <section style={{ padding: '0 48px 80px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', marginBottom: 8 }}>Stiluri similare</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>Stiluri recomandate pe baza culorilor, materialelor și categoriei acestui stil.</p>
          </div>
          <div className="museum-grid">
            {recommendations.map(rec => (
              <Link key={rec.id} to={`/styles/${rec.slug}`} className="museum-frame-card">
                <div className="museum-frame-inner" style={{ height: 240 }}>
                  {img(rec.imageUrl)
                    ? <img src={img(rec.imageUrl)} alt={rec.title} className="museum-artwork-img" style={{ height: '100%' }} />
                    : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                </div>
                <div className="museum-card-meta">
                  <p className="museum-card-note">Stil recomandat</p>
                  <h3>{rec.title || rec.name}</h3>
                  <p>{(rec.kicker || rec.description)?.slice(0, 80)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Gallery photo objects panel ── */}
      {galleryPhoto && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}
          onClick={() => setGalleryPhoto(null)}
        >
          {/* Backdrop */}
          <div style={{ flex: 1, background: 'rgba(26,20,16,0.5)' }} />

          {/* Panel */}
          <div
            style={{ width: 380, background: 'var(--cream)', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ borderBottom: '1px solid var(--card-border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Obiecte din imagine
              </span>
              <button onClick={() => setGalleryPhoto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            <img
              src={img(galleryPhoto.imageUrl)}
              alt=""
              style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }}
            />

            <div style={{ padding: '20px' }}>
              {galleryPhoto.caption && (
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', marginBottom: 20, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {galleryPhoto.caption}
                </p>
              )}

              {galleryPhoto.objects?.length === 0 ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7 }}>
                  Nu au fost adăugate obiecte pentru această fotografie.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {galleryPhoto.objects.map(obj => (
                    <div key={obj.id} style={{ border: '1px solid var(--card-border)', background: 'var(--card)' }}>
                      {obj.imageUrl && img(obj.imageUrl) && (
                        <img src={img(obj.imageUrl)} alt={obj.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                      )}
                      <div style={{ padding: '12px 14px 14px' }}>
                        <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', marginBottom: 4 }}>
                          {obj.name}
                        </h4>
                        {obj.description && (
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 8, lineHeight: 1.6 }}>
                            {obj.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          {obj.price && (
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>
                              {obj.price}
                            </span>
                          )}
                          {obj.shopLink && (
                            <a href={obj.shopLink} target="_blank" rel="noopener noreferrer"
                              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--card-border)', paddingBottom: 1 }}>
                              Cumpără →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto moodboard modal */}
      {moodModal && user && moodboards.length > 0 && (
        <div className="modal-overlay" onClick={() => setMoodModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Adaugă în Moodboard</h2>
            <p>Imaginea a fost salvată la favorite. Vrei să o adaugi și într-un moodboard?</p>
            <select className="moodboard-select" value={selBoard} onChange={e => setSelBoard(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
              {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleFavToMoodboard}>Adaugă</button>
              <button className="btn btn-ghost" onClick={() => setMoodModal(null)}>Nu acum</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
