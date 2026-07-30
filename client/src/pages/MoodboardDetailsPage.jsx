import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function MoodboardDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moodboard, setMoodboard] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [shareUrl,  setShareUrl]  = useState('');
  const [sharing,   setSharing]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login?message=auth-required'); return; }
    api.get(`/api/moodboards/${id}`)
      .then(r => setMoodboard(r.data))
      .catch(() => toast.error('Eroare la încărcarea moodboard-ului.'))
      .finally(() => setLoading(false));
  }, [id, navigate, token]);

  const handleRemoveItem = async (imageId) => {
    try {
      await api.delete(`/api/moodboards/${id}/items/${imageId}`);
      setMoodboard(prev => ({ ...prev, items: prev.items.filter(i => i.imageId !== imageId) }));
      toast.success('Eliminat din moodboard.');
    } catch {
      toast.error('Eroare la eliminare.');
    }
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      let left = ih;
      let pos = 0;
      pdf.addImage(imgData, 'PNG', 0, pos, pw, ih);
      left -= ph;
      while (left > 0) {
        pos = left - ih;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, pos, pw, ih);
        left -= ph;
      }
      pdf.save(`${moodboard.title || 'moodboard'}-nestify.pdf`);
      toast.success('PDF exportat!');
    } catch {
      toast.error('Eroare la export PDF.');
    }
    setExporting(false);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/api/moodboards/${id}/share`);
      setShareUrl(res.data.shareUrl);
      await navigator.clipboard.writeText(res.data.shareUrl);
      toast.success('Link copiat în clipboard!');
    } catch {
      toast.error('Eroare la generarea linkului.');
    }
    setSharing(false);
  };

  // calculate style breakdown from items
  const styleBreakdown = (() => {
    if (!moodboard?.items?.length) return [];
    const counts = {};
    moodboard.items.forEach(item => {
      const s = item.image?.style;
      if (!s) return;
      const key = s.title || s.name;
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = moodboard.items.length;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  })();

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  if (!moodboard) return (
    <div className="museum-home">
      <Navbar />
      <div style={{ padding: '80px 48px' }} className="empty-state">
        <h3>Moodboard-ul nu a fost găsit</h3>
        <Link to="/moodboards" className="btn btn-primary" style={{ marginTop: 20 }}>Înapoi la moodboards</Link>
      </div>
    </div>
  );

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Header ── */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <span className="museum-kicker">Moodboard personal</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          {moodboard.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          {moodboard.items?.length || 0} {moodboard.items?.length === 1 ? 'cameră salvată' : 'camere salvate'} în această colecție
        </p>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? 'Se exportă…' : '↓ Exportă PDF'}
          </button>
          <button className="btn btn-ghost" onClick={handleShare} disabled={sharing}>
            {sharing ? 'Se generează…' : '⟁ Partajează'}
          </button>
          <Link to="/moodboards" className="btn btn-ghost">← Toate moodboards</Link>
        </div>

        {/* Style breakdown */}
        {styleBreakdown.length > 0 && (
          <div style={{ marginTop: 28, background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', maxWidth: 560 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 14 }}>
              ✦ Analiza stilului colecției
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {styleBreakdown.map(({ name, pct }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share URL */}
        {shareUrl && (
          <div style={{ marginTop: 20, background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', maxWidth: 600 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flex: 1, wordBreak: 'break-all' }}>{shareUrl}</span>
            <button className="btn btn-accent btn-sm" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Copiat!'); }}>
              Copiază
            </button>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <main style={{ padding: '52px 48px 100px' }} ref={exportRef}>
        {moodboard.items?.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 20 }}>Nu există camere în acest moodboard.</p>
            <Link to="/" className="btn btn-primary">Explorează stiluri →</Link>
          </div>
        ) : (
          <div className="interior-grid">
            {moodboard.items.map(item => (
              <article
                key={item.id}
                style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Link
                  to={`/styles/${item.image?.style?.slug}/interiors/${item.image?.slug}`}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <img
                    src={img(item.image?.imageUrl)}
                    alt={item.image?.title}
                    style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '16px 18px 8px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>
                      {item.image?.style?.title || item.image?.style?.name}
                    </p>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', marginBottom: 4 }}>{item.image?.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.image?.subtitle}</p>
                  </div>
                </Link>

                {/* Objects list */}
                {item.image?.objects?.length > 0 && (
                  <div style={{ padding: '0 18px 12px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Obiecte</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {item.image.objects.slice(0, 3).map(obj => (
                        <span key={obj.id} className="badge">{obj.name}</span>
                      ))}
                      {item.image.objects.length > 3 && (
                        <span className="badge">+{item.image.objects.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Remove button */}
                <div style={{ padding: '8px 18px 16px', borderTop: '1px solid var(--cream-dark)' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', padding: 0 }}
                    onClick={() => handleRemoveItem(item.imageId)}
                  >
                    × Scoate din moodboard
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
