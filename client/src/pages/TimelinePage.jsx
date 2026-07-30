import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const imgUrl = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

// Static historical data — merged with live DB styles for images/slugs
const HISTORY = [
  { period: 'Sec. XVII–XVIII', year: 1700, style: 'Baroc', slugHint: 'baroc',
    desc: 'Opulență extremă, mișcare dramatică, ornamente somptuoase. Palate europene cu tapiserii, candelabre masive și lemn aurit.',
    colors: ['Auriu', 'Vișiniu', 'Albastru regal'], origin: 'Franța, Italia' },
  { period: 'Sec. XVIII–XIX', year: 1780, style: 'Neoclasic', slugHint: 'neoclasic',
    desc: 'Simetrie, rafinament și sobrietate inspirate din Grecia antică și Roma. Coloane, medalioane, mobilier cu linii drepte.',
    colors: ['Alb crem', 'Auriu mat', 'Gri perle'], origin: 'Europa Occidentală' },
  { period: 'Sec. XIX', year: 1850, style: 'Victorian', slugHint: 'victorian',
    desc: 'Plin, bogat și eclectic. Textile grele, perdele de catifea, colecții de obiecte, lemn întunecat și modele florale.',
    colors: ['Bordo', 'Verde smarald', 'Maro nuc'], origin: 'Anglia' },
  { period: '1900–1940', year: 1910, style: 'Art Nouveau', slugHint: 'art-nouveau',
    desc: 'Forme organice din natură, linii ondulate, motive florale și insecte. Sticlă colorată, ceramică și metal forjat.',
    colors: ['Verde oliv', 'Galben ocru', 'Maro cald'], origin: 'Belgia, Franța' },
  { period: '1920–1940', year: 1925, style: 'Art Deco', slugHint: 'art-deco',
    desc: 'Geometrie elegantă, lux și modernitate. Materiale nobile, oglinzi, lacuri strălucitoare și compoziții simetrice.',
    colors: ['Auriu', 'Negru', 'Alb perlat'], origin: 'Franța, SUA' },
  { period: '1950–prezent', year: 1955, style: 'Scandinav', slugHint: 'scandinav',
    desc: 'Funcțional, luminos și cald. Lemn deschis, textile naturale, forme simple și liniștite. Design pentru viața cotidiană.',
    colors: ['Alb', 'Bej', 'Lemn natur'], origin: 'Țările nordice' },
  { period: '1960–1990', year: 1970, style: 'Minimalist', slugHint: 'minimalist',
    desc: 'Mai puțin înseamnă mai mult. Spații goale, obiecte cu scop clar, linie curată și absența decorului non-esențial.',
    colors: ['Alb', 'Gri', 'Negru'], origin: 'Germania, Japonia' },
  { period: '1970–1990', year: 1975, style: 'Boho', slugHint: 'boho',
    desc: 'Liber, eclectic și plin de texturi. Plante, coșuri împletite, covoare marocane, motive etnice și culori pământii.',
    colors: ['Teracotă', 'Ocru', 'Verde ferigă'], origin: 'Global (influențe marocane, indiene)' },
  { period: '1990–prezent', year: 1995, style: 'Industrial', slugHint: 'industrial',
    desc: 'Beton, oțel și cărămidă aparentă. Foste fabrici reconvertite în lofturi. Brut, autentic și urban.',
    colors: ['Gri beton', 'Rugina', 'Negru mat'], origin: 'New York, Londra' },
  { period: '2000–prezent', year: 2005, style: 'Mediterranean', slugHint: 'mediterranean',
    desc: 'Lumina Mediteranei în interior. Teracotă, ceramică pictată, arcade și țesături din in în nuanțe de soare și mare.',
    colors: ['Albastru cobalt', 'Teracotă', 'Alb calcar'], origin: 'Spania, Grecia, Italia' },
  { period: '2010–prezent', year: 2015, style: 'Japandi', slugHint: 'japandi',
    desc: 'Fuziunea între estetica japoneză wabi-sabi și minimalismul scandinav. Calm, natural și intenționat.',
    colors: ['Bej', 'Gri cald', 'Ceramică mată'], origin: 'Japonia + Scandinavia' },
  { period: '2015–prezent', year: 2018, style: 'Coastal', slugHint: 'coastal',
    desc: 'Inspirat de viața la mare. Lemn albit, alb, albastru, materiale naturale și o atmosferă aeriată și relaxată.',
    colors: ['Alb', 'Albastru nisip', 'Bej'], origin: 'SUA, Australia' },
];

const normalize = (s) => String(s || '').toLowerCase().replace(/[\s-]/g, '');

export default function TimelinePage() {
  const [active,   setActive]   = useState(null);
  const [dbStyles, setDbStyles] = useState([]);

  useEffect(() => {
    api.get('/api/styles').then(r => setDbStyles(r.data)).catch(() => {});
  }, []);

  // Merge static history with DB styles
  const entries = (() => {
    const merged = HISTORY.map(h => {
      const match = dbStyles.find(s =>
        normalize(s.slug) === normalize(h.slugHint) ||
        normalize(s.title) === normalize(h.style)
      );
      return { ...h, dbStyle: match || null };
    });
    // Append DB styles not in HISTORY
    const knownSlugs = new Set(HISTORY.map(h => normalize(h.slugHint)));
    dbStyles.forEach(s => {
      if (!knownSlugs.has(normalize(s.slug)) && !knownSlugs.has(normalize(s.title))) {
        merged.push({
          period: 'Contemporan',
          year: 2020,
          style: s.title,
          slugHint: s.slug,
          desc: s.description || s.kicker || '',
          colors: Array.isArray(s.colors) ? s.colors : [],
          origin: '—',
          dbStyle: s,
        });
      }
    });
    return merged.sort((a, b) => a.year - b.year);
  })();

  return (
    <div className="museum-home">
      <Navbar />

      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <span className="museum-kicker">Istoria designului interior</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Cronologia stilurilor
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.8 }}>
          De la baroc la contemporan — urmărește cum a evoluat designul interior de-a lungul secolelor.
        </p>
      </div>

      <main style={{ padding: '56px 48px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 128, top: 0, bottom: 0, width: 1, background: 'var(--card-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {entries.map((item, i) => {
              const isActive = active === i;
              const coverUrl = imgUrl(item.dbStyle?.imageUrl);
              const slug = item.dbStyle?.slug || item.slugHint;

              return (
                <div key={i} style={{ display: 'flex', gap: 0, alignItems: 'flex-start', position: 'relative' }}>

                  {/* Period label */}
                  <div style={{ width: 118, textAlign: 'right', paddingRight: 20, paddingTop: 22, flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.4 }}>
                      {item.period}
                    </p>
                  </div>

                  {/* Dot */}
                  <div
                    style={{ width: 16, height: 16, borderRadius: '50%', background: isActive ? 'var(--text)' : 'var(--cream-dark)', border: `2px solid ${isActive ? 'var(--text)' : 'var(--card-border)'}`, flexShrink: 0, marginTop: 22, zIndex: 1, cursor: 'pointer', transition: 'all 0.18s' }}
                    onClick={() => setActive(isActive ? null : i)}
                  />

                  {/* Card */}
                  <div
                    onClick={() => setActive(isActive ? null : i)}
                    style={{ flex: 1, margin: '8px 0 8px 24px', background: isActive ? 'var(--white)' : 'transparent', border: isActive ? '1px solid var(--card-border)' : '1px solid transparent', padding: '14px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: 'var(--text)', margin: 0 }}>
                        {item.style}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                        {isActive ? '▴' : '▾'}
                      </span>
                    </div>

                    {isActive && (
                      <div style={{ marginTop: 16 }}>
                        {/* Cover image from DB */}
                        {coverUrl && (
                          <div style={{ height: 220, overflow: 'hidden', marginBottom: 18, background: 'var(--cream-dark)' }}>
                            <img src={coverUrl} alt={item.style} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}

                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                          {item.desc}
                        </p>

                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 16 }}>
                          {item.colors.length > 0 && (
                            <div>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 8 }}>Culori caracteristice</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {item.colors.map(c => (
                                  <span key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', border: '1px solid var(--card-border)', padding: '3px 10px', color: 'var(--text)', fontWeight: 300 }}>{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 8 }}>Origine</p>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: 'var(--text)' }}>{item.origin}</span>
                          </div>
                        </div>

                        {slug && (
                          <Link to={`/styles/${slug}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--text)', paddingBottom: 2 }}
                            onClick={e => e.stopPropagation()}>
                            Explorează în Nestify →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 60, background: 'var(--cream-dark)', padding: '40px 48px', textAlign: 'center', borderTop: '1px solid var(--card-border)' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', marginBottom: 8 }}>Care stil te reprezintă?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>Fă quiz-ul pentru a descoperi stilul care se potrivește personalității tale.</p>
          <Link to="/quiz" className="btn btn-primary">Style Quiz →</Link>
        </div>
      </main>
    </div>
  );
}
