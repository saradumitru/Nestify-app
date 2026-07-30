import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";
const img = (url) => (!url ? null : url.startsWith("http") ? url : `${API_URL}${url}`);

const getFavoritePath = (favorite) => {
  if (favorite.styleGalleryPhoto?.style?.slug) return `/styles/${favorite.styleGalleryPhoto.style.slug}`;
  if (favorite.interiorGalleryPhoto?.interior?.style?.slug && favorite.interiorGalleryPhoto?.interior?.slug) {
    return `/styles/${favorite.interiorGalleryPhoto.interior.style.slug}/interiors/${favorite.interiorGalleryPhoto.interior.slug}`;
  }

  const image = favorite.image;
  const styleSlug = image?.style?.slug;

  if (styleSlug && image?.slug) return `/styles/${styleSlug}/interiors/${image.slug}`;
  if (styleSlug) return `/styles/${styleSlug}`;
  if (image?.roomType) return `/rooms/${encodeURIComponent(image.roomType)}`;
  return "/search";
};

const getFavoriteImageUrl = (favorite) =>
  favorite.image?.imageUrl ||
  favorite.styleGalleryPhoto?.imageUrl ||
  favorite.interiorGalleryPhoto?.imageUrl;

const getFavoriteTitle = (favorite) =>
  favorite.image?.title ||
  favorite.styleGalleryPhoto?.caption ||
  favorite.interiorGalleryPhoto?.caption ||
  "Fotografie salvată";

const getFavoriteSubtitle = (favorite) =>
  favorite.image?.subtitle ||
  favorite.styleGalleryPhoto?.style?.title ||
  favorite.interiorGalleryPhoto?.interior?.title ||
  "";

const getFavoriteNote = (favorite) => {
  if (favorite.styleGalleryPhoto) return "Fotografie de stil";
  if (favorite.interiorGalleryPhoto) return favorite.interiorGalleryPhoto.interior?.style?.title || "Fotografie de interior";
  return favorite.image?.style?.title || "Cameră";
};

const getRemovePayload = (favorite) => {
  if (favorite.imageId) return { imageId: favorite.imageId };
  if (favorite.styleGalleryPhotoId) return { styleGalleryPhotoId: favorite.styleGalleryPhotoId };
  if (favorite.interiorGalleryPhotoId) return { interiorGalleryPhotoId: favorite.interiorGalleryPhotoId };
  return null;
};

function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [moodboards,  setMoodboards]  = useState([]);
  const [moodModal,   setMoodModal]   = useState(null);
  const [selBoard,    setSelBoard]    = useState("");

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch { user = null; }
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) { navigate("/login"); return; }
    Promise.all([
      api.get("/api/favorites"),
      api.get("/api/moodboards"),
    ]).then(([favRes, boardRes]) => {
      setFavorites(favRes.data);
      setMoodboards(boardRes.data);
      setSelBoard(boardRes.data[0]?.id ? String(boardRes.data[0].id) : "");
    }).catch(() => toast.error("Eroare la încărcare."))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (favorite) => {
    const payload = getRemovePayload(favorite);
    if (!payload) return;
    try {
      await api.post("/api/favorites", payload);
      setFavorites(p => p.filter(f => f.id !== favorite.id));
      toast.success("Eliminat din favorite");
    } catch { toast.error("Eroare."); }
  };

  const handleAddToMoodboard = async () => {
    if (!selBoard || !moodModal) return;
    try {
      await api.post(`/api/moodboards/${selBoard}/items`, { imageId: moodModal });
      toast.success("Adăugat în moodboard!");
    } catch (err) {
      if (err?.response?.status === 409) toast.success("Deja în moodboard!");
      else toast.error("Eroare la adăugare.");
    }
    setMoodModal(null);
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* Page header */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)' }}>
        <span className="kicker">Colecția ta</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Favoritele mele
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          {favorites.length > 0
            ? `${favorites.length} ${favorites.length === 1 ? 'imagine salvată' : 'imagini salvate'} — apasă pe ♡ pentru a elimina.`
            : 'Explorează stiluri și salvează imaginile care îți plac.'}
        </p>
      </div>

      <main style={{ padding: '48px 48px 100px' }}>
        {favorites.length === 0 ? (
          <div className="empty-state">
            <h3>Nu ai încă favorite</h3>
            <p>Explorează stilurile și apasă pe ♡ pentru a salva imaginile care te inspiră.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Explorează stiluri →</Link>
          </div>
        ) : (
          <div className="museum-grid">
            {favorites.map(fav => (
              <article key={fav.id} className="museum-frame-outer">
                <Link
                  to={getFavoritePath(fav)}
                  className="museum-frame-card museum-frame-link"
                >
                  <div className="museum-frame-inner" style={{ height: 280 }}>
                    {img(getFavoriteImageUrl(fav))
                      ? <img src={img(getFavoriteImageUrl(fav))} alt={getFavoriteTitle(fav)} className="museum-artwork-img" style={{ height: '100%' }} />
                      : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                  </div>
                  <div className="museum-card-meta">
                    <p className="museum-card-note">{getFavoriteNote(fav)}</p>
                    <h3>{getFavoriteTitle(fav)}</h3>
                    <p>{getFavoriteSubtitle(fav)?.slice(0, 80)}{getFavoriteSubtitle(fav)?.length > 80 ? '…' : ''}</p>
                  </div>
                </Link>

                {/* Action buttons overlay */}
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8, zIndex: 2 }}>
                  {fav.imageId && (
                    <button
                      className="museum-heart-button"
                      title="Adaugă în moodboard"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setMoodModal(fav.imageId); }}
                      style={{ fontSize: '0.9rem' }}
                    >🗂</button>
                  )}
                  <button
                    className="museum-heart-button saved"
                    title="Elimină din favorite"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemove(fav); }}
                  >♥</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Add to moodboard modal */}
      {moodModal && (
        <div className="modal-overlay" onClick={() => setMoodModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Adaugă în Moodboard</h2>
            {moodboards.length > 0 ? (
              <>
                <p>Alege moodboard-ul în care vrei să adaugi această imagine.</p>
                <select className="moodboard-select" value={selBoard} onChange={e => setSelBoard(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
                  {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToMoodboard}>Adaugă</button>
                  <button className="btn btn-ghost" onClick={() => setMoodModal(null)}>Anulează</button>
                </div>
              </>
            ) : (
              <>
                <p>Nu ai încă niciun moodboard. Creează unul, apoi poți adăuga imaginea salvată din favorite.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to="/moodboards" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Creează moodboard</Link>
                  <button className="btn btn-ghost" onClick={() => setMoodModal(null)}>Anulează</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
