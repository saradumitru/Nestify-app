import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import usePersistentState from '../hooks/usePersistentState';

const API_URL = 'http://localhost:5000';
const imgUrl = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

const readFileDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function RoomDetectorPage() {
  const [preview, setPreview] = usePersistentState('nestify:room-detector:preview', null);
  const [hint,    setHint]    = usePersistentState('nestify:room-detector:hint', '');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = usePersistentState('nestify:room-detector:result', null);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(await readFileDataUrl(file));
    setResult(null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(await readFileDataUrl(file));
    setResult(null);
    const dt = new DataTransfer();
    dt.items.add(file);
    fileRef.current.files = dt.files;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file && !hint.trim()) { toast.error('Adaugă o imagine sau o descriere.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      if (file) form.append('image', file);
      if (hint.trim()) form.append('prompt', hint.trim());

      const res = await api.post('/api/assistant', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch {
      toast.error('Eroare la analiză. Încearcă din nou.');
    }
    setLoading(false);
  };

  const ca = result?.detected?.claudeAnalysis;

  return (
    <div className="museum-home">
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
        <span className="museum-kicker">Identificare vizuală</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Detectează stilul camerei tale
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
          Încarcă o fotografie a camerei tale. Asistentul AI identifică stilul, obiectele și îți recomandă unde poți cumpăra produse similare.
        </p>
      </div>

      <main style={{ padding: '48px 48px 100px', maxWidth: 960, margin: '0 auto' }}>
        <form onSubmit={handleAnalyze}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28, alignItems: 'start' }}>

            {/* Upload zone */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 12 }}>
                1. Fotografia camerei
              </p>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current.click()}
                style={{ border: `2px dashed ${preview ? 'var(--brown)' : 'var(--card-border)'}`, overflow: 'hidden', cursor: 'pointer', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', transition: 'border-color 0.2s' }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📷</div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Trage o imagine sau apasă</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {preview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
                  onClick={() => { setPreview(null); setResult(null); fileRef.current.value = ''; }}>
                  × Schimbă imaginea
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 12 }}>
                2. Descrie camera <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(opțional dacă ai poză)</span>
              </p>
              <textarea
                className="assistant-textarea"
                placeholder="Ex: Camera are pereți albi, canapea gri cu perne bej, o masă din lemn deschis și o plantă mare în colț. Iluminarea este caldă..."
                value={hint}
                onChange={e => setHint(e.target.value)}
                rows={8}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6, fontWeight: 300 }}>
                Cu cât descrii mai detaliat culorile și materialele, cu atât recomandările sunt mai precise.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || (!preview && !hint.trim())}
            style={{ minWidth: 260 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Se analizează cu Asistentul AI…
              </span>
            ) : 'Identifică stilul și obiectele →'}
          </button>
        </form>

        {/* ── Results ── */}
        {result && (
          <div style={{ marginTop: 64 }}>

            {/* AI Summary card */}
            <div style={{ background: 'var(--cream-dark)', padding: '28px 32px', marginBottom: 40, borderLeft: '3px solid var(--brown)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: 10 }}>
                {ca ? '✦ Analiză Asistentul AI' : '✦ Analiză Nestify'}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', lineHeight: 1.75, color: 'var(--text)', marginBottom: ca ? 18 : 0 }}>
                {result.message}
              </p>

              {/* Style badges + confidence */}
              {ca && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {ca.primaryStyle && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--cream)', padding: '5px 14px' }}>
                      {ca.primaryStyle}
                    </span>
                  )}
                  {ca.secondaryStyle && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--text)', color: 'var(--text)', padding: '5px 14px' }}>
                      + {ca.secondaryStyle}
                    </span>
                  )}
                  {ca.roomType && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                      · {ca.roomType}
                    </span>
                  )}
                  {ca.confidence && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                      · Încredere: {ca.confidence}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Detected objects strip */}
            {ca?.detectedObjects?.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                  Obiecte identificate în imagine
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ca.detectedObjects.map((obj, i) => (
                    <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, border: '1px solid var(--card-border)', padding: '5px 14px', color: 'var(--text)', background: 'var(--white)' }}>
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matched products with buy links */}
            {result.matchedProducts?.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Unde poți cumpăra
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', margin: 0 }}>
                      Produse similare
                    </h2>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {result.matchedProducts.map((product, i) => (
                    <div key={i} style={{ border: '1px solid var(--card-border)', background: 'var(--white)', padding: '20px 22px' }}>
                      {/* Source badge */}
                      {product.source === 'db' && (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brown)', background: 'var(--cream-dark)', padding: '2px 8px', display: 'inline-block', marginBottom: 10 }}>
                          Din Nestify
                        </span>
                      )}
                      {/* Product image (DB only) */}
                      {product.imageUrl && imgUrl(product.imageUrl) && (
                        <div style={{ height: 120, overflow: 'hidden', marginBottom: 12, background: 'var(--cream-dark)' }}>
                          <img src={imgUrl(product.imageUrl)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                        {product.category}
                      </p>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', marginBottom: 14, color: 'var(--text)' }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {product.links.map((link, j) => (
                          <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 400, color: 'var(--text)', textDecoration: 'none', padding: '7px 12px', border: '1px solid var(--card-border)', background: 'var(--cream-dark)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--card-border)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                          >
                            <span>{link.label || link.store}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                              {link.price && <span style={{ fontWeight: 500, color: 'var(--text)' }}>{link.price}</span>}
                              <span style={{ fontSize: '0.7rem' }}>→</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Style recommendations from app */}
            {result.recommendations?.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Stiluri din Nestify
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', marginBottom: 8 }}>
                  Explorează stiluri similare
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 20, lineHeight: 1.7, maxWidth: 600 }}>
                  Ordinea e calculată după cât de mult se potrivesc culorile, materialele și cuvintele-cheie detectate de Claude cu fiecare stil din aplicație.
                  {ca ? ' Stilul identificat vizual primește un bonus suplimentar.' : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {result.recommendations.map((style, i) => (
                    <Link key={style.id} to={`/styles/${style.slug}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--card-border)', background: 'var(--white)', display: 'block', overflow: 'hidden' }}>
                      <div style={{ height: 180, overflow: 'hidden', background: 'var(--cream-dark)', position: 'relative' }}>
                        {imgUrl(style.imageUrl)
                          ? <img src={imgUrl(style.imageUrl)} alt={style.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          : <div style={{ height: '100%', background: 'var(--beige)' }} />
                        }
                        {i === 0 && (
                          <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--brown)', color: '#fff', padding: '3px 8px' }}>
                            Potrivire maximă
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '14px 18px 18px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 4 }}>
                          {style.category?.name || 'Stil interior'}
                        </p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', margin: 0 }}>{style.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Colors + Materials + Advice */}
            {result.suggestions && (
              <section style={{ marginBottom: 40 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Recomandări
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', marginBottom: 24 }}>
                  Ce să adaugi în cameră
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {result.suggestions.colors?.length > 0 && (
                    <div style={{ border: '1px solid var(--card-border)', padding: '20px 22px', background: 'var(--white)' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Paletă cromatică</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {result.suggestions.colors.map(c => (
                          <span key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', border: '1px solid var(--card-border)', padding: '4px 12px', fontWeight: 300 }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.suggestions.materials?.length > 0 && (
                    <div style={{ border: '1px solid var(--card-border)', padding: '20px 22px', background: 'var(--white)' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Materiale recomandate</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {result.suggestions.materials.map(m => (
                          <span key={m} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', border: '1px solid var(--card-border)', padding: '4px 12px', fontWeight: 300 }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.suggestions.advice && (
                    <div style={{ border: '1px solid var(--card-border)', padding: '20px 22px', background: 'var(--cream-dark)' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>✦ Sfat Claude AI</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8 }}>{result.suggestions.advice}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--card-border)' }}>
              <Link to="/palette" className="btn btn-primary">Generator paletă →</Link>
              <Link to="/compare" className="btn btn-ghost">Compară stiluri</Link>
              <button className="btn btn-ghost" onClick={() => { setResult(null); setPreview(null); setHint(''); fileRef.current.value = ''; }}>
                Analizează din nou
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
