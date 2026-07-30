import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000";
const img = (url) => (!url ? null : url.startsWith("http") ? url : `${API_URL}${url}`);

/* ─── Preset filter chips ───────────────────────────────────────────────── */
const COLOR_PRESETS = [
  "Albastru",
  "Naturale",
  "Alb",
  "Auriu",
  "Bej",
  "Bleumarin",
  "Burgundy",
  "Crem",
  "Gri",
  "Maro",
  "Negru",
  "Roz prăfuit",
  "Taupe",
  "Terracotta",
  "Olive",
  "Verde salvie",
];
const MATERIAL_PRESETS = [
  "Lemn",
  "Bambus",
  "Bumbac",
  "Catifea",
  "Ceramică",
  "Sticlă",
  "Marmură",
  "Metal",
  "Ratan",
  "Piele",
  "In",
  "Lână",
  "Piatră",
  "Beton",
];
const STYLE_CHIPS     = ["Minimalist", "Scandinav", "Boho", "Japandi", "Industrial", "Clasic", "Mid-Century", "Provencal"];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query,    setQuery]    = useState(searchParams.get("q") || "");
  const [color,    setColor]    = useState(searchParams.get("color") || "");
  const [material, setMaterial] = useState(searchParams.get("material") || "");

  const [results,  setResults]  = useState({ styles: [], interiors: [] });
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState("all");   // all | styles | interiors
  const [filterOptions, setFilterOptions] = useState({ colors: [], materials: [] });

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [moodboards,  setMoodboards]  = useState([]);
  const [moodModal,   setMoodModal]   = useState(null);
  const [selBoard,    setSelBoard]    = useState("");

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  /* Load filter options once */
  useEffect(() => {
    api.get("/api/search/filters").then(r => setFilterOptions(r.data)).catch(() => {});
    if (user) {
      api.get("/api/favorites").then(r => setFavoriteIds(r.data.map(f => f.imageId))).catch(() => {});
      api.get("/api/moodboards").then(r => { setMoodboards(r.data); setSelBoard(r.data[0]?.id ? String(r.data[0].id) : ""); }).catch(() => {});
    }
  }, []);

  /* Run search whenever params change */
  useEffect(() => {
    const q  = searchParams.get("q")       || "";
    const c  = searchParams.get("color")   || "";
    const m  = searchParams.get("material")|| "";
    setQuery(q); setColor(c); setMaterial(m);

    if (!q && !c && !m) { setResults({ styles: [], interiors: [] }); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (c) params.set("color", c);
        if (m) params.set("material", m);
        const res = await api.get(`/api/search?${params}`);
        setResults(res.data || { styles: [], interiors: [] });
      } catch { setResults({ styles: [], interiors: [] }); }
      setLoading(false);
    };
    fetch();
  }, [searchParams]);

  const applySearch = (overrides = {}) => {
    const params = {};
    const q  = overrides.q        !== undefined ? overrides.q        : query;
    const c  = overrides.color    !== undefined ? overrides.color    : color;
    const m  = overrides.material !== undefined ? overrides.material : material;
    if (q.trim()) params.q        = q.trim();
    if (c.trim()) params.color    = c.trim();
    if (m.trim()) params.material = m.trim();
    setSearchParams(params);
  };

  const toggleChip = (type, val) => {
    if (type === "color")    { const next = color    === val ? "" : val; setColor(next);    applySearch({ color: next }); }
    if (type === "material") { const next = material === val ? "" : val; setMaterial(next); applySearch({ material: next }); }
    if (type === "style")    { const next = query    === val ? "" : val; setQuery(next);    applySearch({ q: next }); }
  };

  const handleToggleFavorite = async (imageId, e) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!user) { navigate("/login"); return; }
    const was = favoriteIds.includes(imageId);
    setFavoriteIds(p => was ? p.filter(id => id !== imageId) : [...p, imageId]);
    try {
      await api.post("/api/favorites", { imageId });
      if (!was) { toast.success("Adăugat la favorite!"); setMoodModal(imageId); }
      else toast.success("Eliminat din favorite");
    } catch { setFavoriteIds(p => was ? [...p, imageId] : p.filter(id => id !== imageId)); }
  };

  const handleAddToMoodboard = async () => {
    if (!selBoard || !moodModal) return;
    try { await api.post(`/api/moodboards/${selBoard}/items`, { imageId: moodModal }); toast.success("Adăugat în moodboard!"); }
    catch (err) { if (err?.response?.status === 409) toast.success("Deja în moodboard!"); else toast.error("Eroare"); }
    setMoodModal(null);
  };

  const visStyles    = tab !== "interiors" ? results.styles   : [];
  const visInteriors = tab !== "styles"    ? results.interiors : [];
  const totalResults = results.styles.length + results.interiors.length;
  const hasActive    = query || color || material;

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero / Search bar ── */}
      <section className="hero-landing" style={{ borderRadius: 0, padding: '72px 48px 52px' }}>
        <span className="kicker">Căutare avansată</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 18 }}>
          Găsește designul perfect
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.85, marginBottom: 28 }}>
          Caută după stil, culori, materiale sau tipul de cameră și descoperă inspirația potrivită pentru tine.
        </p>

        <form
          onSubmit={e => { e.preventDefault(); applySearch(); }}
          style={{ display: 'flex', gap: 12, maxWidth: 680 }}
        >
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Stil, cameră, atmosferă…"
            className="museum-search-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="museum-search-button">Caută</button>
        </form>

        {/* Color chips */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Culori</p>
          <div className="chip-list">
            {(filterOptions.colors.length ? filterOptions.colors : COLOR_PRESETS).map(c => (
              <button key={c} className={`chip${color === c ? ' active' : ''}`} onClick={() => toggleChip("color", c)} type="button">{c}</button>
            ))}
          </div>
        </div>

        {/* Material chips */}
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Materiale</p>
          <div className="chip-list">
            {(filterOptions.materials.length ? filterOptions.materials : MATERIAL_PRESETS).map(m => (
              <button key={m} className={`chip${material === m ? ' active' : ''}`} onClick={() => toggleChip("material", m)} type="button">{m}</button>
            ))}
          </div>
        </div>

        {/* Style chips */}
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Stiluri populare</p>
          <div className="chip-list">
            {STYLE_CHIPS.map(s => (
              <button key={s} className={`chip${query === s ? ' active' : ''}`} onClick={() => toggleChip("style", s)} type="button">{s}</button>
            ))}
          </div>
        </div>

        {/* Active filters summary */}
        {hasActive && (
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Filtre active:</span>
            {query    && <span className="chip active">{query} <button style={{ marginLeft: 4 }} onClick={() => { setQuery(""); applySearch({ q: "" }); }}>×</button></span>}
            {color    && <span className="chip active">🎨 {color} <button style={{ marginLeft: 4 }} onClick={() => { setColor(""); applySearch({ color: "" }); }}>×</button></span>}
            {material && <span className="chip active">🪵 {material} <button style={{ marginLeft: 4 }} onClick={() => { setMaterial(""); applySearch({ material: "" }); }}>×</button></span>}
            <button style={{ fontSize: '0.82rem', color: 'var(--text-light)', textDecoration: 'underline' }} onClick={() => { setQuery(""); setColor(""); setMaterial(""); setSearchParams({}); }}>Resetează tot</button>
          </div>
        )}
      </section>

      {/* ── Results ── */}
      <main className="museum-main">
        {loading ? (
          <div className="loading-spinner" />
        ) : !hasActive ? (
          <div className="empty-state">
            <h3>Începe căutarea</h3>
            <p>Introdu un termen sau aplică filtre de culori și materiale pentru a descoperi stiluri și camere.</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="empty-state">
            <h3>Nicio potrivire găsită</h3>
            <p>Încearcă alte cuvinte sau filtre. Unele culori/materiale pot fi disponibile doar în anumite stiluri.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => { setQuery(""); setColor(""); setMaterial(""); setSearchParams({}); }}>Resetează filtrele</button>
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 36, borderBottom: '1px solid var(--cream-dark)', paddingBottom: 16 }}>
              {[
                { key: "all",       label: `Toate (${totalResults})` },
                { key: "styles",    label: `Stiluri (${results.styles.length})` },
                { key: "interiors", label: `Camere (${results.interiors.length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '9px 20px', borderRadius: 99, fontSize: '0.88rem', fontWeight: 600,
                    background: tab === t.key ? 'var(--text)' : 'transparent',
                    color: tab === t.key ? 'var(--cream)' : 'var(--text-muted)',
                    border: tab === t.key ? 'none' : '1.5px solid var(--card-border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{t.label}</button>
              ))}
            </div>

            {/* Styles section */}
            {visStyles.length > 0 && (
              <section className="museum-section">
                <div className="museum-section-head"><h2>Stiluri</h2></div>
                <div className="museum-grid">
                  {visStyles.map(style => (
                    <Link key={`s-${style.id}`} to={`/styles/${style.slug}`} className="museum-frame-card">
                      <div className="museum-frame-inner" style={{ height: 260 }}>
                        {img(style.imageUrl)
                          ? <img src={img(style.imageUrl)} alt={style.title} className="museum-artwork-img" style={{ height: '100%' }} />
                          : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                      </div>
                      <div className="museum-card-meta">
                        <p className="museum-card-note">{style.kicker || "Stil interior"}</p>
                        <h3>{style.title}</h3>
                        <p>{style.description?.slice(0, 100)}{style.description?.length > 100 ? '…' : ''}</p>
                        {(Array.isArray(style.colors) ? style.colors : []).length > 0 && (
                          <div className="chip-list" style={{ marginTop: 12 }}>
                            {(Array.isArray(style.colors) ? style.colors : []).slice(0, 3).map(c => (
                              <span key={c} className="chip" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Interiors section */}
            {visInteriors.length > 0 && (
              <section className="museum-section">
                <div className="museum-section-head"><h2>Camere</h2></div>
                <div className="museum-grid">
                  {visInteriors.map(interior => {
                    const isFav = favoriteIds.includes(interior.id);
                    return (
                      <article key={`i-${interior.id}`} className="museum-frame-outer">
                        <Link to={`/styles/${interior.style?.slug}/interiors/${interior.slug}`} className="museum-frame-card museum-frame-link">
                          <div className="museum-frame-inner" style={{ height: 260 }}>
                            {img(interior.imageUrl)
                              ? <img src={img(interior.imageUrl)} alt={interior.title} className="museum-artwork-img" style={{ height: '100%' }} />
                              : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                          </div>
                          <div className="museum-card-meta">
                            <p className="museum-card-note">{interior.style?.title || "Cameră"}</p>
                            <h3>{interior.title}</h3>
                            <p>{(interior.subtitle || interior.description || '')?.slice(0, 90)}…</p>
                          </div>
                        </Link>
                        <button
                          className={`museum-heart-button${isFav ? ' saved' : ''}`}
                          onClick={(e) => handleToggleFavorite(interior.id, e)}
                          title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                        >{isFav ? '♥' : '♡'}</button>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ── Auto moodboard modal ── */}
      {moodModal && user && moodboards.length > 0 && (
        <div className="modal-overlay" onClick={() => setMoodModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Adaugă în Moodboard</h2>
            <p>Imaginea a fost salvată la favorite. Vrei să o adaugi și într-un moodboard?</p>
            <select className="moodboard-select" value={selBoard} onChange={e => setSelBoard(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
              {moodboards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToMoodboard}>Adaugă</button>
              <button className="btn btn-ghost" onClick={() => setMoodModal(null)}>Nu acum</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
