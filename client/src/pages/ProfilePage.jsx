import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";
const img = (url) => (!url ? null : url.startsWith("http") ? url : `${API_URL}${url}`);

const getFavoritePath = (favorite) => {
  if (favorite.image?.style?.slug && favorite.image?.slug) return `/styles/${favorite.image.style.slug}/interiors/${favorite.image.slug}`;
  if (favorite.styleGalleryPhoto?.style?.slug) return `/styles/${favorite.styleGalleryPhoto.style.slug}`;
  if (favorite.interiorGalleryPhoto?.interior?.style?.slug && favorite.interiorGalleryPhoto?.interior?.slug) {
    return `/styles/${favorite.interiorGalleryPhoto.interior.style.slug}/interiors/${favorite.interiorGalleryPhoto.interior.slug}`;
  }
  return '/favorites';
};

const getFavoriteImageUrl = (favorite) =>
  favorite.image?.imageUrl ||
  favorite.styleGalleryPhoto?.imageUrl ||
  favorite.interiorGalleryPhoto?.imageUrl;

const getFavoriteTitle = (favorite) =>
  favorite.image?.title ||
  favorite.styleGalleryPhoto?.caption ||
  favorite.interiorGalleryPhoto?.caption ||
  'Fotografie salvată';

const getFavoriteMeta = (favorite) =>
  favorite.image?.style?.title ||
  favorite.styleGalleryPhoto?.style?.title ||
  favorite.interiorGalleryPhoto?.interior?.title ||
  'Favorite';

function ProfilePage() {
  const navigate = useNavigate();
  const [favorites,   setFavorites]   = useState([]);
  const [moodboards,  setMoodboards]  = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading,     setLoading]     = useState(true);

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) { navigate("/login"); return; }
    Promise.all([
      api.get("/api/favorites"),
      api.get("/api/moodboards"),
      api.get("/api/quiz/results"),
    ]).then(([f, m, q]) => {
      setFavorites(f.data); setMoodboards(m.data); setQuizResults(q.data);
    }).catch(() => toast.error("Eroare la încărcare."))
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const latestQuiz = quizResults[0];
  const canEditDesignerProfile = user?.role === 'DESIGNER' || user?.role === 'ADMIN';
  const quickLinks = [
    { to: '/favorites', icon: '♡', label: 'Favoritele mele' },
    { to: '/moodboards', label: 'Moodboards' },
    { to: '/projects', label: 'Proiectele mele' },
    ...(canEditDesignerProfile ? [{ to: '/designer/profile', icon: 'ID', label: 'Profil designer' }] : []),
    { to: '/quiz', icon: '✦', label: 'Style Quiz' },
    { to: '/budget-estimator', label: 'Budget Estimator' },
    { to: '/assistant', label: 'AI Assistant' },
  ];

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      <div className="profile-layout">
        {/* ── Sidebar ── */}
        <aside>
          <div className="profile-sidebar">
            <div className="profile-avatar">{initials}</div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 14px', borderRadius: 99, background: 'var(--cream-dark)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-md)' }}>
              {user?.role === 'ADMIN' ? 'Administrator' : 'Utilizator'}
            </span>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-n">{favorites.length}</div>
                <div className="profile-stat-label">Favorite</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-n">{moodboards.length}</div>
                <div className="profile-stat-label">Moodboards</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-n">{quizResults.length}</div>
                <div className="profile-stat-label">Quiz-uri</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-n">{moodboards.reduce((acc, b) => acc + (b.items?.length || 0), 0)}</div>
                <div className="profile-stat-label">Imagini</div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 20, marginTop: 20 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-light)', marginBottom: 14 }}>Acțiuni rapide</p>
            {quickLinks.map(item => (
              <Link key={item.to} to={item.to} className="nav-drop-item" style={{ borderRadius: 'var(--radius-sm)', display: 'flex', gap: 10, padding: '11px 10px' }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main>
          {/* Latest quiz result */}
          {latestQuiz?.recommendedStyle && (
            <section style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 36, display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
              <div>
                <span className="kicker">Stilul tău recomandat</span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 8 }}>
                  {latestQuiz.recommendedStyle.title || latestQuiz.recommendedStyle.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
                  {latestQuiz.recommendedStyle.description?.slice(0, 140)}…
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to={`/styles/${latestQuiz.recommendedStyle.slug}`} className="btn btn-primary btn-sm">Explorează stilul →</Link>
                  <Link to="/quiz" className="btn btn-ghost btn-sm">Repetă quiz-ul</Link>
                </div>
              </div>
              {latestQuiz.recommendedStyle.imageUrl && (
                <img src={img(latestQuiz.recommendedStyle.imageUrl)} alt={latestQuiz.recommendedStyle.title}
                  style={{ width: 160, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
              )}
            </section>
          )}

          {!latestQuiz && (
            <section style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 36, textAlign: 'center' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', marginBottom: 10 }}>Descoperă-ți stilul</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Completează quiz-ul și îți vom recomanda un stil perfect pentru tine.</p>
              <Link to="/quiz" className="btn btn-primary">Începe Style Quiz →</Link>
            </section>
          )}

          {/* Recent favorites */}
          {favorites.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem' }}>Favorite recente</h2>
                <Link to="/favorites" className="museum-link" style={{ fontSize: '0.88rem' }}>Vezi toate →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                {favorites.slice(0, 4).map(fav => (
                  <Link key={fav.id}
                    to={getFavoritePath(fav)}
                    style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'block', background: 'var(--white)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    {img(getFavoriteImageUrl(fav))
                      ? <img src={img(getFavoriteImageUrl(fav))} alt={getFavoriteTitle(fav)} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                      : <div style={{ height: 160, background: 'var(--beige)' }} />}
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{getFavoriteTitle(fav)}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getFavoriteMeta(fav)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Moodboards */}
          {moodboards.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem' }}>Moodboard-urile mele</h2>
                <Link to="/moodboards" className="museum-link" style={{ fontSize: '0.88rem' }}>Gestionează →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                {moodboards.slice(0, 4).map(board => (
                  <Link key={board.id} to={`/moodboards/${board.id}`}
                    style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'block', background: 'var(--white)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    {board.items?.[0]?.image?.imageUrl
                      ? <img src={img(board.items[0].image.imageUrl)} alt={board.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                      : <div style={{ height: 140, background: 'var(--beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎨</div>}
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{board.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(board.items || []).length} imagini</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Quiz history */}
          {quizResults.length > 1 && (
            <section>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', marginBottom: 16 }}>Istoricul quiz-ului</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quizResults.slice(0, 5).map((r, i) => (
                  <div key={r.id} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                        {r.recommendedStyle?.title || 'Stil necunoscut'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {i === 0 ? 'Cel mai recent' : `Quiz #${quizResults.length - i}`}
                      </p>
                    </div>
                    {r.recommendedStyle?.slug && (
                      <Link to={`/styles/${r.recommendedStyle.slug}`} className="btn btn-ghost btn-sm">Explorează →</Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
