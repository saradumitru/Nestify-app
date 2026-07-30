import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

const toArray = (value) =>
  Array.isArray(value) ? value : (value ? Object.values(value) : []);

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const tokenize = (value) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(token => token.length > 3);

const jaccard = (leftItems, rightItems) => {
  const leftSet = new Set(leftItems.map(normalize).filter(Boolean));
  const rightSet = new Set(rightItems.map(normalize).filter(Boolean));
  if (!leftSet.size && !rightSet.size) return 0;

  const intersection = [...leftSet].filter(item => rightSet.has(item)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  return union ? intersection / union : 0;
};

const textSimilarity = (left, right) =>
  jaccard(
    tokenize([left.kicker, left.description, left.history, left.audience].join(' ')),
    tokenize([right.kicker, right.description, right.history, right.audience].join(' '))
  );

const calculateSimilarity = (left, right) => {
  if (!left || !right) return { score: 0, details: [] };
  if (left.id && right.id && String(left.id) === String(right.id)) {
    return {
      score: 100,
      details: ['Același stil selectat'],
    };
  }

  const details = [];
  const colorScore = jaccard(toArray(left.colors), toArray(right.colors));
  const materialScore = jaccard(toArray(left.materials), toArray(right.materials));
  const categoryScore = left.category?.id && right.category?.id && left.category.id === right.category.id ? 1 : 0;
  const periodScore = normalize(left.period) && normalize(left.period) === normalize(right.period) ? 1 : 0;
  const contentScore = textSimilarity(left, right);

  const weighted =
    colorScore * 30 +
    materialScore * 30 +
    categoryScore * 18 +
    periodScore * 7 +
    contentScore * 15;

  if (colorScore > 0) details.push(`culori comune ${Math.round(colorScore * 100)}%`);
  if (materialScore > 0) details.push(`materiale comune ${Math.round(materialScore * 100)}%`);
  if (categoryScore) details.push('aceeași categorie');
  if (periodScore) details.push('aceeași perioadă');
  if (contentScore > 0.12) details.push('descrieri apropiate');

  return {
    score: Math.min(99, Math.round(weighted)),
    details,
  };
};

export default function ComparePage() {
  const [styles,  setStyles]  = useState([]);
  const [leftId,  setLeftId]  = useState('');
  const [rightId, setRightId] = useState('');
  const [left,    setLeft]    = useState(null);
  const [right,   setRight]   = useState(null);

  useEffect(() => {
    api.get('/api/styles').then(r => setStyles(r.data)).catch(() => {});
  }, []);

  const handleLeftChange = (event) => {
    const nextId = event.target.value;
    setLeftId(nextId);
    if (!nextId) {
      setLeft(null);
      return;
    }

    const slug = styles.find(s => String(s.id) === String(nextId))?.slug;
    if (slug) api.get(`/api/styles/${slug}`).then(r => setLeft(r.data)).catch(() => {});
  };

  const handleRightChange = (event) => {
    const nextId = event.target.value;
    setRightId(nextId);
    if (!nextId) {
      setRight(null);
      return;
    }

    const slug = styles.find(s => String(s.id) === String(nextId))?.slug;
    if (slug) api.get(`/api/styles/${slug}`).then(r => setRight(r.data)).catch(() => {});
  };

  const colors    = s => toArray(s?.colors);
  const materials = s => toArray(s?.materials);

  const Row = ({ label, leftVal, rightVal }) => (
    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', width: 120 }}>{label}</td>
      <td style={{ padding: '14px 16px', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.7 }}>{leftVal || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
      <td style={{ padding: '14px 16px', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.7 }}>{rightVal || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
    </tr>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', textAlign: 'center' }}>
        <span className="museum-kicker">Analiză comparativă</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Compară stiluri
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Selectează două stiluri și descoperă diferențele și asemănările dintre ele.
        </p>
      </div>

      <main style={{ padding: '48px 48px 100px' }}>

        {/* Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center', marginBottom: 48, maxWidth: 800, margin: '0 auto 48px' }}>
          <select
            className="moodboard-select"
            value={leftId}
            onChange={handleLeftChange}
            style={{ padding: '14px 16px', fontSize: '1rem' }}
          >
            <option value="">Alege primul stil…</option>
            {styles.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>

          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', color: 'var(--text-muted)', textAlign: 'center' }}>vs</div>

          <select
            className="moodboard-select"
            value={rightId}
            onChange={handleRightChange}
            style={{ padding: '14px 16px', fontSize: '1rem' }}
          >
            <option value="">Alege al doilea stil…</option>
            {styles.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        {(!left && !right) && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Selectează două stiluri de mai sus pentru a vedea comparația.</p>
        )}

        {(left || right) && (
          <>
            {/* Cover images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              {[left, right].map((style, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 260, background: 'var(--cream-dark)', position: 'relative' }}>
                  {style && img(style.imageUrl)
                    ? <img src={img(style.imageUrl)} alt={style.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : style
                      ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', color: 'var(--text-muted)' }}>{style.title}</span></div>
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--text-muted)' }}>Selectează un stil</span></div>
                  }
                  {style && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(42,31,26,0.8))', padding: '20px 20px 16px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{style.category?.name}</p>
                      <h2 style={{ color: 'white', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', margin: 0 }}>{style.title}</h2>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            {left && right && (() => {
              const norm = s => String(s || '').toLowerCase().trim();
              const lColors = colors(left).map(norm);
              const rColors = colors(right).map(norm);
              const lMats   = materials(left).map(norm);
              const rMats   = materials(right).map(norm);
              const commonColors = colors(left).filter(c => rColors.includes(norm(c)));
              const commonMats   = materials(left).filter(m => rMats.includes(norm(m)));
              const similarity = calculateSimilarity(left, right);
              const simScore = similarity.score;

              return (
                <>
                  {/* Similarity bar */}
                  <div style={{ background: 'var(--cream-dark)', padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                        Similaritate estimată
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--card-border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${simScore}%`, background: simScore > 50 ? 'var(--brown)' : 'var(--text)', transition: 'width 0.6s' }} />
                        </div>
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: 'var(--text)', minWidth: 40 }}>{simScore}%</span>
                      </div>
                    </div>
                    {(commonColors.length > 0 || commonMats.length > 0) && (
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                          Elemente comune
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {commonColors.map(c => <span key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', border: '1px solid var(--brown)', color: 'var(--brown)', padding: '2px 8px' }}>{c}</span>)}
                          {commonMats.map(m => <span key={m} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', border: '1px solid var(--card-border)', color: 'var(--text)', padding: '2px 8px' }}>{m}</span>)}
                        </div>
                      </div>
                    )}
                    {similarity.details.length > 0 && (
                      <div style={{ flexBasis: '100%' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          Calcul bazat pe: {similarity.details.join(', ')}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'var(--white)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--cream-dark)' }}>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', width: 130 }}>Criteriu</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', color: 'var(--text)' }}>{left.title}</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', color: 'var(--text)' }}>{right.title}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <Row label="Perioadă" leftVal={left.period} rightVal={right.period} />
                        <Row label="Descriere" leftVal={left.kicker || left.description?.slice(0, 120)} rightVal={right.kicker || right.description?.slice(0, 120)} />
                        <Row label="Influențe" leftVal={left.history?.slice(0, 120)} rightVal={right.history?.slice(0, 120)} />
                        <Row label="Potrivit pentru" leftVal={left.audience} rightVal={right.audience} />
                        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>Culori</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {colors(left).map(c => (
                                <span key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', border: `1px solid ${rColors.includes(norm(c)) ? 'var(--brown)' : 'var(--card-border)'}`, color: rColors.includes(norm(c)) ? 'var(--brown)' : 'var(--text)', padding: '2px 8px' }}>{c}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {colors(right).map(c => (
                                <span key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', border: `1px solid ${lColors.includes(norm(c)) ? 'var(--brown)' : 'var(--card-border)'}`, color: lColors.includes(norm(c)) ? 'var(--brown)' : 'var(--text)', padding: '2px 8px' }}>{c}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>Materiale</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {materials(left).map(m => (
                                <span key={m} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', border: `1px solid ${rMats.includes(norm(m)) ? 'var(--brown)' : 'var(--card-border)'}`, color: rMats.includes(norm(m)) ? 'var(--brown)' : 'var(--text)', padding: '2px 8px' }}>{m}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {materials(right).map(m => (
                                <span key={m} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', border: `1px solid ${lMats.includes(norm(m)) ? 'var(--brown)' : 'var(--card-border)'}`, color: lMats.includes(norm(m)) ? 'var(--brown)' : 'var(--text)', padding: '2px 8px' }}>{m}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* Quick links */}
            <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
              {left  && <Link to={`/styles/${left.slug}`}  className="btn btn-ghost">Explorează {left.title} →</Link>}
              {right && <Link to={`/styles/${right.slug}`} className="btn btn-ghost">Explorează {right.title} →</Link>}
              <Link to="/quiz" className="btn btn-primary">Style Quiz →</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
