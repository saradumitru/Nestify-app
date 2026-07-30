import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import usePersistentState from '../hooks/usePersistentState';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

const PROMPTS = [
  "Living minimalist cu accente naturale și lemn deschis",
  "Dormitor feminin și romantic cu catifea și roz prăfuit",
  "Bucătărie modernă japandi cu marmură și bambus",
  "Birou productiv cu estetică industrială și beton",
  "Sufragerie scandinavă cozy cu textile calde",
];

export default function AssistantPage() {
  const [prompt,  setPrompt]  = usePersistentState('nestify:assistant:prompt', '');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = usePersistentState('nestify:assistant:result', null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/api/assistant', { prompt });
      setResult(res.data);
    } catch {
      toast.error('Eroare la generarea recomandărilor.');
    }
    setLoading(false);
  };

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ padding: '72px 48px 60px', background: 'var(--cream-dark)', textAlign: 'center' }}>
        <span className="kicker" style={{ color: 'var(--brown)' }}>AI Design Assistant</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.2rem,5vw,3.8rem)', marginBottom: 16 }}>
          Descrie atmosfera pe care o vrei
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.85 }}>
          Spune-ne ce stil îți place și Nestify îți recomandă stiluri interioare, materiale și camere potrivite — pe baza descrierii tale.
        </p>

        <form onSubmit={handleGenerate} style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea
            className="assistant-textarea"
            placeholder="Ex: Vreau un living cozy, feminin și elegant cu accente vintage și plante verzi..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
          />

          {/* Prompt suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {PROMPTS.map(p => (
              <button
                key={p} type="button"
                className="chip"
                onClick={() => setPrompt(p)}
                style={{ fontSize: '0.8rem' }}
              >{p}</button>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || !prompt.trim()}
            style={{ alignSelf: 'center', minWidth: 220 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Se generează…
              </span>
            ) : 'Generează recomandări →'}
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      {result && (
        <main style={{ padding: '56px 48px 100px' }}>

          {/* Style recommendations */}
          {result.recommendations?.length > 0 && (
            <section className="museum-section">
              <div className="museum-section-head">
                <h2>Stiluri recomandate</h2>
                <p>{result.message}</p>
              </div>
              <div className="museum-grid">
                {result.recommendations.map(style => (
                  <Link key={style.id} to={`/styles/${style.slug}`} className="museum-frame-card">
                    <div className="museum-frame-inner" style={{ height: 260 }}>
                      {img(style.imageUrl)
                        ? <img src={img(style.imageUrl)} alt={style.title} className="museum-artwork-img" style={{ height: '100%' }} />
                        : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                    </div>
                    <div className="museum-card-meta">
                      <p className="museum-card-note">
                        {style.assistantScore ? `Potrivire: ${style.assistantScore}` : 'Stil recomandat'}
                      </p>
                      <h3>{style.title}</h3>
                      <p>{style.description?.slice(0, 100)}{style.description?.length > 100 ? '…' : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recommended rooms */}
          {result.recommendedRooms?.length > 0 && (
            <section className="museum-section">
              <div className="museum-section-head">
                <h2>Camere recomandate</h2>
                <p>Aceste camere se potrivesc cel mai bine descrierii tale.</p>
              </div>
              <div className="museum-grid">
                {result.recommendedRooms.map(room => (
                  <Link key={room.id} to={`/styles/${room.style?.slug}/interiors/${room.slug}`} className="museum-frame-card">
                    <div className="museum-frame-inner" style={{ height: 260 }}>
                      {img(room.imageUrl)
                        ? <img src={img(room.imageUrl)} alt={room.title} className="museum-artwork-img" style={{ height: '100%' }} />
                        : <div style={{ height: '100%', background: 'var(--beige)' }} />}
                    </div>
                    <div className="museum-card-meta">
                      <p className="museum-card-note">{room.style?.title} {room.assistantScore ? `· scor ${room.assistantScore}` : ''}</p>
                      <h3>{room.title}</h3>
                      <p>{room.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Colors + Materials + Advice */}
          {result.suggestions && (
            <section className="museum-section">
              <div className="museum-section-head">
                <h2>Sugestii personalizate</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                {result.suggestions.colors?.length > 0 && (
                  <div className="style-panel-card">
                    <h3> Paletă recomandată</h3>
                    <div className="badge-list">
                      {result.suggestions.colors.map(c => <span key={c} className="badge">{c}</span>)}
                    </div>
                  </div>
                )}
                {result.suggestions.materials?.length > 0 && (
                  <div className="style-panel-card">
                    <h3> Materiale recomandate</h3>
                    <div className="badge-list">
                      {result.suggestions.materials.map(m => <span key={m} className="badge">{m}</span>)}
                    </div>
                  </div>
                )}
                {result.suggestions.advice && (
                  <div className="style-panel-card">
                    <h3>✦ Sfat Nestify</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.92rem' }}>{result.suggestions.advice}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{ marginTop: 40, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link to="/quiz" className="btn btn-primary">Fă Style Quiz →</Link>
                <Link to="/moodboards" className="btn btn-ghost">Creează Moodboard</Link>
                <button className="btn btn-ghost" onClick={() => { setResult(null); setPrompt(''); }}>Încearcă o altă descriere</button>
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}
