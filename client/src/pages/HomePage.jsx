import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000";

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
};

const HERO_SLIDES = [
  { kicker: "Stil Minimalist", title: "Eleganța prin simplitate", desc: "Spații curate, linii clare și materiale naturale care respiră calm." },
  { kicker: "Design Scandinav", title: "Căldura nordului în locuința ta", desc: "Lemn deschis, textile moi și lumina naturală ca element principal." },
  { kicker: "Interior Boho", title: "Libertatea formelor și culorilor", desc: "Texturi eclectice, plante și piese vintage într-o armonie unică." },
];

function HomePage() {
  const [styles, setStyles] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [moodboardModal, setMoodboardModal] = useState(null);
  const [moodboards, setMoodboards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [personalized, setPersonalized] = useState(null);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);
  const styleScrollRef = useRef(null);
  const roomScrollRef = useRef(null);
  const [styleScroll, setStyleScroll] = useState(0);
  const [roomScroll, setRoomScroll] = useState(0);
  const dragRef = useRef(null);
  const didDragRef = useRef(false);
  const navigate = useNavigate();

  const makeDragScroll = (ref) => ({
    onMouseDown(e) {
      if (e.button !== 0) return;
      dragRef.current = { x: e.clientX, scrollLeft: ref.current.scrollLeft };
      didDragRef.current = false;
    },
    onMouseMove(e) {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      if (Math.abs(dx) > 5) didDragRef.current = true;
      ref.current.scrollLeft = dragRef.current.scrollLeft - dx;
    },
    onMouseUp() { dragRef.current = null; },
    onMouseLeave() { dragRef.current = null; },
    onClickCapture(e) {
      if (didDragRef.current) {
        e.stopPropagation();
        e.preventDefault();
        didDragRef.current = false;
      }
    },
  });

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  useEffect(() => {
    api.get("/api/styles").then(r => setStyles(r.data)).catch(console.error).finally(() => setLoading(false));
    api.get("/api/rooms").then(r => setRooms(r.data)).catch(() => {});
    api.get("/api/stories").then(r => setStories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get("/api/favorites").then(r => setFavoriteIds(r.data.map(f => f.imageId))).catch(console.error);
    api.get("/api/moodboards").then(r => { setMoodboards(r.data); setSelectedBoard(r.data[0]?.id ? String(r.data[0].id) : ""); }).catch(console.error);
    api.get("/api/styles/personalized").then(r => setPersonalized(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    clearTimeout(searchTimerRef.current);
    if (!val.trim()) { setSearchResults(null); return; }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(val.trim())}`);
        setSearchResults(res.data);
      } catch {}
      setSearchLoading(false);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
  };

  const handleToggleFavorite = async (imageId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const wasFav = favoriteIds.includes(imageId);
    setFavoriteIds(prev => wasFav ? prev.filter(id => id !== imageId) : [...prev, imageId]);
    try {
      await api.post('/api/favorites', { imageId });
      if (!wasFav) {
        toast.success('Adăugat la favorite!');
        setMoodboardModal(imageId);
      } else {
        toast.success('Eliminat din favorite');
      }
    } catch {
      setFavoriteIds(prev => wasFav ? [...prev, imageId] : prev.filter(id => id !== imageId));
    }
  };

  const handleAddToMoodboard = async () => {
    if (!selectedBoard || !moodboardModal) return;
    try {
      await api.post(`/api/moodboards/${selectedBoard}/items`, { imageId: moodboardModal });
      toast.success('Adăugat în moodboard!');
    } catch (err) {
      if (err?.response?.status === 409) toast.success('Deja în moodboard!');
      else toast.error('Eroare la adăugare');
    }
    setMoodboardModal(null);
  };

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Editorial strip ── */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '9px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cream)' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 300, letterSpacing: '0.14em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Vol. I — Interioare, atmosfere, cinematic homes
        </span>
      </div>

      {/* ── Editorial Hero ── */}
      <section
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderBottom: '1px solid var(--card-border)',
    height: 640,
    overflow: 'hidden'
  }}
>

        {/* Left — text */}
        <div style={{ padding: '64px 56px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--card-border)' }}>
          <div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--brown)', display: 'block', marginBottom: 36 }}>
              The Archive of Interiors
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(3.2rem, 5.5vw, 5.8rem)', fontWeight: 500, lineHeight: 0.96, marginBottom: 32, letterSpacing: '-0.01em' }}>
              Spații care<br /><em style={{ fontWeight: 400 }}>spun povești.</em>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.9, maxWidth: 400, fontFamily: 'Inter, sans-serif', fontWeight: 300, marginBottom: 36 }}>
              O arhivă de interioare, case cinematografice și atmosfere care fac un spațiu să pară locuit. Explorează multiple moduri de a transforma o simplă cameră într-un spațiu cu suflet.
            </p>

            {/* Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
              {['Minimalist', 'Scandinav', 'Boho', 'Industrial', 'Clasic'].map(s => (
                <Link key={s} to={`/search?q=${s}`} style={{ textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.1em', color: 'var(--text-muted)', border: '1px solid var(--card-border)', padding: '5px 14px', borderRadius: 0, transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.color = 'var(--cream)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{s}</Link>
              ))}
            </div>
          </div>

          {/* Search + CTAs */}
          <div>
            <form onSubmit={handleSearchSubmit} ref={searchRef} style={{ position: 'relative', marginBottom: 20 }}>
              <div style={{ display: 'flex', border: '1px solid var(--card-border)', borderRadius: 0, overflow: 'hidden' }}>
                <input
                  type="search"
                  placeholder="Caută stiluri, camere, materiale…"
                  value={searchText}
                  onChange={handleSearchChange}
                  autoComplete="off"
                  style={{ flex: 1, padding: '13px 18px', border: 'none', outline: 'none', background: 'var(--white)', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: 'var(--text)' }}
                />
                <button type="submit" style={{ padding: '13px 22px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Caută
                </button>
              </div>
              {searchResults && (
                <div className="hero-search-results" style={{ borderRadius: 0, border: '1px solid var(--card-border)', borderTop: 'none' }}>
                  {searchResults.styles?.length > 0 && (
                    <>
                      <h4>Stiluri</h4>
                      {searchResults.styles.slice(0, 4).map(s => (
                        <Link key={s.id} to={`/styles/${s.slug}`} className="hero-search-item" onClick={() => setSearchResults(null)}>
                          <span>{s.title}</span><small>{s.kicker || 'Stil interior'}</small>
                        </Link>
                      ))}
                    </>
                  )}
                  {searchResults.interiors?.length > 0 && (
                    <>
                      <h4>Camere</h4>
                      {searchResults.interiors.slice(0, 4).map(i => (
                        <Link key={i.id} to={`/styles/${i.style?.slug}/interiors/${i.slug}`} className="hero-search-item" onClick={() => setSearchResults(null)}>
                          <span>{i.title}</span><small>{i.style?.title}</small>
                        </Link>
                      ))}
                    </>
                  )}
                  {!searchLoading && !searchResults.styles?.length && !searchResults.interiors?.length && (
                    <p style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nicio potrivire găsită</p>
                  )}
                </div>
              )}
            </form>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/quiz" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 24px', background: 'var(--text)', color: 'var(--cream)', textDecoration: 'none', transition: 'opacity 0.2s' }}>
                Style Quiz →
              </Link>
              <Link to="/moodboards" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 24px', border: '1px solid var(--card-border)', color: 'var(--text)', textDecoration: 'none', transition: 'background 0.2s' }}>
                Moodboards
              </Link>
            </div>
          </div>
        </div>

        {/* Right — style image grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gap: 1, background: 'var(--card-border)', overflow: 'hidden' }}>
          {[0,1,2,3].map(i => {
            const s = styles[i];
            return (
              <Link key={i} to={s ? `/styles/${s.slug}` : '/'} style={{ display: 'block', overflow: 'hidden', background: 'var(--beige)', position: 'relative' }}>
                {s?.imageUrl
                  ? <img src={getImageSrc(s.imageUrl)} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  : <div style={{ width: '100%', height: '100%', background: `hsl(${28 + i*12}, ${18-i*2}%, ${82-i*4}%)` }} />
                }
                {s && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%', background: 'linear-gradient(to bottom, rgba(26,20,16,0.7), rgba(26,20,16,0.34) 56%, transparent)', zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: 18, left: 0, right: 0, padding: '0 16px 24px', zIndex: 2, boxSizing: 'border-box' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,241,235,0.82)', marginBottom: 2, margin: '0 0 4px 0', padding: 0, textShadow: '0 1px 10px rgba(0,0,0,0.28)' }}>
                        Interior Style
                      </p>
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.08rem', fontWeight: 500, color: 'var(--cream)', lineHeight: 1.15, margin: 0, padding: 0, textShadow: '0 2px 14px rgba(0,0,0,0.35)' }}>
                        {s.title}
                      </p>
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Personalized section ── */}
      {personalized && personalized.styles.length > 0 && (
        <section style={{ padding: '64px 48px 0', maxWidth: '1380px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span className="museum-kicker">✦ Recomandat pentru tine</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginTop: 6 }}>
                {personalized.basedOn === 'quiz' ? 'Bazat pe quiz-ul tău' : 'Stiluri populare'}
              </h2>
            </div>
            <Link to="/quiz" className="btn btn-ghost btn-sm">Retestează →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {personalized.styles.map(style => (
              <Link key={style.id} to={`/styles/${style.slug}`} style={{ display: 'block', textDecoration: 'none', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)', color: 'inherit', position: 'relative' }}>
                {style.relevanceScore >= 10 && (
                  <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 20, zIndex: 1 }}>
                    Potrivit pentru tine
                  </span>
                )}
                <div style={{ height: 160, overflow: 'hidden', background: 'var(--cream-dark)' }}>
                  {style.imageUrl && <img src={getImageSrc(style.imageUrl)} alt={style.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>
                    {style.category?.name}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', marginBottom: 4 }}>{style.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {style.kicker || style.description?.slice(0, 60)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Vol. I — Caută după stil ── */}
      <main>
        <section style={{ padding: '72px 0 60px', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, padding: '0 48px' }}>
            <div>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Vol. I</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)', margin: 0 }}>Caută după stil</h2>
            </div>
            <Link to="/search" style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--card-border)', paddingBottom: 2 }}>Vezi toate →</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              ref={styleScrollRef}
              onScroll={e => setStyleScroll(e.currentTarget.scrollLeft)}
              {...makeDragScroll(styleScrollRef)}
              style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '0 48px 4px', cursor: 'grab', userSelect: 'none' }}
            >
              {styles.map(style => (
                <Link key={style.id} to={`/styles/${style.slug}`} style={{ flexShrink: 0, width: 180, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ height: 240, overflow: 'hidden', background: 'var(--cream-dark)' }}>
                    {style.imageUrl
                      ? <img src={getImageSrc(style.imageUrl)} alt={style.title} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--beige)' }} />
                    }
                  </div>
                  <div style={{ minHeight: 58, padding: '12px 0 16px', borderBottom: '1px solid var(--card-border)', boxSizing: 'border-box' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', lineHeight: 1.2, margin: 0, color: 'var(--text)', overflowWrap: 'anywhere' }}>{style.title}</p>
                  </div>
                </Link>
              ))}
            </div>
            {styles.length > 5 && styleScroll > 0 && (
              <button onClick={() => styleScrollRef.current?.scrollBy({ left: -360, behavior: 'smooth' })} style={{ position: 'absolute', left: 16, top: '40%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 2 }}>‹</button>
            )}
            {styles.length > 5 && (
              <button onClick={() => styleScrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' })} style={{ position: 'absolute', right: 16, top: '40%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 2 }}>›</button>
            )}
          </div>
        </section>

        {/* ── Vol. II — Caută după cameră ── */}
        <section style={{ padding: '72px 0 60px', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, padding: '0 48px' }}>
            <div>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Vol. II</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)', margin: 0 }}>Caută după cameră</h2>
            </div>
          </div>
          {rooms.length === 0 ? (
            <p style={{ padding: '0 48px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>Nicio cameră adăugată încă.</p>
          ) : (
            <div style={{ position: 'relative' }}>
              <div
                ref={roomScrollRef}
                onScroll={e => setRoomScroll(e.currentTarget.scrollLeft)}
                {...makeDragScroll(roomScrollRef)}
                style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '0 48px 4px', cursor: 'grab', userSelect: 'none' }}
              >
                {rooms.map(room => (
                  <Link key={room.id} to={`/rooms/${encodeURIComponent(room.title)}`} style={{ flexShrink: 0, width: 220, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={{ height: 180, overflow: 'hidden', background: 'var(--cream-dark)' }}>
                      {room.imageUrl
                        ? <img src={getImageSrc(room.imageUrl)} alt={room.title} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                        : <div style={{ width: '100%', height: '100%', background: 'var(--beige)' }} />
                      }
                    </div>
                    <div style={{ minHeight: 76, padding: '12px 0 16px', borderBottom: '1px solid var(--card-border)', textAlign: 'center', boxSizing: 'border-box' }}>
                      <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', lineHeight: 1.2, margin: 0, color: 'var(--text)', overflowWrap: 'anywhere' }}>{room.title}</p>
                      {room.description && <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{room.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
              {rooms.length > 4 && roomScroll > 0 && (
                <button onClick={() => roomScrollRef.current?.scrollBy({ left: -440, behavior: 'smooth' })} style={{ position: 'absolute', left: 16, top: '40%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 2 }}>‹</button>
              )}
              {rooms.length > 4 && (
                <button onClick={() => roomScrollRef.current?.scrollBy({ left: 440, behavior: 'smooth' })} style={{ position: 'absolute', right: 16, top: '40%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 2 }}>›</button>
              )}
            </div>
          )}
        </section>

        {/* ── Vol. III — Povești recente ── */}
        <section style={{ padding: '72px 48px 60px', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Vol. III</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)', margin: 0 }}>Povești recente</h2>
            </div>
            <Link to="/stories" style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--card-border)', paddingBottom: 2 }}>See All</Link>
          </div>
          {stories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Niciun articol adăugat încă.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {stories.slice(0, 4).map(story => (
                <Link key={story.id} to={`/stories/${story.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ height: 220, overflow: 'hidden', background: 'var(--cream-dark)', marginBottom: 14 }}>
                    {story.imageUrl
                      ? <img src={getImageSrc(story.imageUrl)} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--beige)' }} />
                    }
                  </div>
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>{story.kicker || 'Popular'}</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.15rem', lineHeight: 1.3, margin: 0, color: 'var(--text)' }}>{story.title}</h3>
                  {story.excerpt && <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.65 }}>{story.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Vol. IV — Only Movies in the Building ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580, marginBottom: 0, overflow: 'hidden', border: '1px solid var(--card-border)', borderLeft: 'none', borderRight: 'none' }}>
          <div style={{ background: 'var(--text)', color: 'var(--cream)', padding: '72px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 32 }}>Vol. IV — Cinematic Homes</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(3rem,5vw,5rem)', fontWeight: 500, lineHeight: 0.95, color: 'var(--cream)', marginBottom: 28 }}>Only Movies<br /><em style={{ fontWeight: 400 }}>in the</em><br />Building</h2>
              <p style={{ color: 'rgba(245,241,235,0.6)', fontSize: '0.88rem', lineHeight: 1.9, maxWidth: 360, fontFamily: 'Inter,sans-serif', fontWeight: 300 }}>Casele iconice ale cinematografiei mondiale. De la vila din <em>The Parent Trap</em> la apartamentul din <em>You've Got Mail</em> — interioare care au scris povești.</p>
            </div>
            <Link to="/movie-houses" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'var(--cream)', fontFamily: 'Inter,sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid rgba(245,241,235,0.25)', paddingBottom: 10, width: 'fit-content', marginTop: 48 }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Explorează casele →</Link>
          </div>
          <div style={{ position: 'relative', overflow: 'hidden', background: '#1a1410', minHeight: 480 }}>
            <img src="http://localhost:5000/uploads/apartment-night.jpeg" alt="Cinematic interior" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.9, position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(26,20,16,0.3), transparent)' }} />
          </div>
        </section>

        {/* ── Style Quiz CTA ── */}
        <section style={{ background: 'var(--cream-dark)', padding: '64px 48px', textAlign: 'center', marginTop: 0 }}>
          <span className="kicker" style={{ color: 'var(--brown)' }}>Style Quiz</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)', marginBottom: '14px' }}>Descoperă-ți stilul de design</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.85 }}>Răspunde la 6 întrebări despre preferințele tale și îți vom sugera stilul interior care ți se potrivește cel mai bine.</p>
          <Link to="/quiz" className="btn btn-primary btn-lg">Începe quiz-ul →</Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Nestify</div>
            <p className="footer-desc">Platforma de inspirație pentru design interior. Salvează, creează, descoperă.</p>
          </div>
          <div>
            <p className="footer-heading">Explorează</p>
            <div className="footer-links">
              <Link to="/">Acasă</Link>
              <Link to="/search">Caută stiluri</Link>
              <Link to="/movie-houses">Only Movies in the Building</Link>
              <Link to="/quiz">Style Quiz</Link>
            </div>
          </div>
          <div>
            <p className="footer-heading">Contul meu</p>
            <div className="footer-links">
              <Link to="/favorites">Favorite</Link>
              <Link to="/moodboards">Moodboards</Link>
              <Link to="/projects">Proiecte</Link>
              <Link to="/profile">Profil</Link>
            </div>
          </div>
          <div>
            <p className="footer-heading">Tools</p>
            <div className="footer-links">
              <Link to="/assistant">AI Assistant</Link>
              <Link to="/budget-estimator">Budget Estimator</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Nestify. Lucrare de licență — Design Interior Digital.</span>
        </div>
      </footer>

      {/* ── Auto-add to moodboard modal ── */}
      {moodboardModal && user && moodboards.length > 0 && (
        <div className="modal-overlay" onClick={() => setMoodboardModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Adaugă în Moodboard</h2>
            <p>Imaginea a fost salvată la favorite. Vrei să o adaugi și într-un moodboard?</p>
            <select
              className="moodboard-select"
              value={selectedBoard}
              onChange={e => setSelectedBoard(e.target.value)}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToMoodboard}>
                Adaugă în moodboard
              </button>
              <button className="btn btn-ghost" onClick={() => setMoodboardModal(null)}>
                Nu acum
              </button>
            </div>
            {moodboards.length === 0 && (
              <p style={{ marginTop: 12, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Nu ai moodboard-uri. <Link to="/moodboards" className="auth-link">Creează unul</Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
