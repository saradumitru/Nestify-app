import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";
const img = (url) => (!url ? null : url.startsWith("http") ? url : `${API_URL}${url}`);

const QUESTIONS = [
  {
    key: "color",
    question: "Ce paletă de culori te atrage?",
    options: [
      { value: "bej",        label: "Bej & crem",           desc: "Tonuri calde și neutre, calme" },
      { value: "alb",        label: "Alb & gri deschis",    desc: "Curat, luminos, aerat" },
      { value: "verde",      label: "Verde natural",         desc: "Tonuri botanice, organice" },
      { value: "burgundy",   label: "Burgundy & auriu",      desc: "Dramatic, bogat, elegant" },
      { value: "terracotta", label: "Terracotta & roz prăfuit", desc: "Cald, artizanal, vintage" },
    ],
  },
  {
    key: "material",
    question: "Ce materiale îți plac cel mai mult?",
    options: [
      { value: "lemn",    label: "Lemn natural",          desc: "Organic, cald, durabil" },
      { value: "catifea", label: "Catifea & marmură",     desc: "Luxos, senzorial, rafinat" },
      { value: "ratan",   label: "Ratan & macrame",       desc: "Artizanal, liber, textural" },
      { value: "in",      label: "In & bumbac & lână",    desc: "Confortabil, natural, simplu" },
      { value: "bambus",  label: "Bambus & ceramică",     desc: "Zen, minimalist, pur" },
    ],
  },
  {
    key: "atmosphere",
    question: "Ce atmosferă vrei să creezi acasă?",
    options: [
      { value: "calm",       label: "Calmă și aerisită",      desc: "Un loc de liniște și respirație" },
      { value: "minimalism", label: "Minimalistă și precisă",  desc: "Fiecare obiect are rolul său" },
      { value: "eclectic",   label: "Eclectică și creativă",   desc: "Mix de epoci și texturi" },
      { value: "luxos",      label: "Elegantă și luxoasă",     desc: "Grandoare și rafinament" },
      { value: "natural",    label: "Naturală și relaxată",    desc: "Conectat cu natura" },
    ],
  },
  {
    key: "complexity",
    question: "Cât de mult decor îți place?",
    options: [
      { value: "minimal",    label: "Minimal",                  desc: "Spațiu gol e spațiu câștigat" },
      { value: "mediu",      label: "Echilibrat",               desc: "Câteva piese selecte" },
      { value: "decorativ",  label: "Bogat și decorativ",       desc: "Obiecte peste tot, cu sens" },
    ],
  },
  {
    key: "budget",
    question: "Ce buget ai în minte?",
    options: [
      { value: "low",     label: "Accesibil",   desc: "DIY și piese funcționale" },
      { value: "medium",  label: "Mediu",       desc: "Mix de calitate și preț" },
      { value: "premium", label: "Premium",     desc: "Investiție pe termen lung" },
    ],
  },
  {
    key: "room",
    question: "Ce cameră vrei să amenajezi?",
    options: [
      { value: "living",   label: "Living",    desc: "Spațiul principal de relaxare" },
      { value: "bedroom",  label: "Dormitor",  desc: "Sanctuarul personal" },
      { value: "kitchen",  label: "Bucătărie", desc: "Inima casei" },
      { value: "office",   label: "Birou",     desc: "Spațiu de productivitate" },
    ],
  },
];

const LETTERS = ["A", "B", "C", "D", "E"];

function QuizPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [step,    setStep]    = useState(0);   // current question index
  const [answers, setAnswers] = useState({});
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;
  const isLast   = step === QUESTIONS.length - 1;

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [current.key]: value }));
  };

  const handleNext = async () => {
    if (!answers[current.key]) { toast.error("Alege o opțiune mai întâi."); return; }
    if (!isLast) { setStep(s => s + 1); return; }

    /* Submit */
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/quiz/results", { answers });
      setResult(res.data);
    } catch {
      toast.error("Eroare la calcularea rezultatului.");
    }
    setLoading(false);
  };

  /* ── Result screen ── */
  if (result) {
    const style = result.recommendedStyle;
    return (
      <div className="museum-home">
        <Navbar />
        <div className="quiz-result">
          <span className="quiz-result-badge">Rezultatul tău</span>
          {style ? (
            <>
              <h1>{style.title || style.name}</h1>
              {typeof result.matchPercentage === "number" && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: 18 }}>
                  {result.matchPercentage}% potrivire
                </p>
              )}
              <p className="quiz-result-desc">
                {style.description || "Acest stil se potrivește perfect preferințelor tale. Descoperă camere, culori și materiale specifice acestui stil."}
              </p>
              {style.imageUrl && (
                <img src={img(style.imageUrl)} alt={style.title} className="quiz-result-img" />
              )}

              {Array.isArray(result.reasons) && result.reasons.length > 0 && (
                <div style={{ maxWidth: 680, margin: '0 auto 34px', textAlign: 'left', background: 'var(--cream-dark)', border: '1px solid var(--card-border)', padding: '22px 24px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                    De ce se potrivește
                  </p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {result.reasons.map((reason) => (
                      <p key={reason} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                        {reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors & materials preview */}
              {((Array.isArray(style.colors) ? style.colors : []).length > 0 || (Array.isArray(style.materials) ? style.materials : []).length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 600, margin: '0 auto 40px', textAlign: 'left' }}>
                  {(Array.isArray(style.colors) ? style.colors : []).length > 0 && (
                    <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-light)', marginBottom: 12 }}>Culori</p>
                      <div className="badge-list">
                        {(Array.isArray(style.colors) ? style.colors : []).map(c => <span key={c} className="badge">{c}</span>)}
                      </div>
                    </div>
                  )}
                  {(Array.isArray(style.materials) ? style.materials : []).length > 0 && (
                    <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-light)', marginBottom: 12 }}>Materiale</p>
                      <div className="badge-list">
                        {(Array.isArray(style.materials) ? style.materials : []).map(m => <span key={m} className="badge">{m}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(result.secondaryStyles) && result.secondaryStyles.length > 0 && (
                <div style={{ maxWidth: 680, margin: '0 auto 38px', textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Stiluri apropiate
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {result.secondaryStyles.map((secondary) => (
                      <Link key={secondary.id} to={`/styles/${secondary.slug}`} style={{ textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--card-border)', padding: '8px 12px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', background: 'var(--cream)' }}>
                        {secondary.title} · {secondary.matchPercentage}%
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="quiz-nav-btns">
                <Link to={`/styles/${style.slug}`} className="btn btn-primary btn-lg">Explorează stilul →</Link>
                <Link to="/moodboards" className="btn btn-ghost btn-lg">Creează Moodboard</Link>
                <button className="btn btn-ghost" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>Repetă quiz-ul</button>
              </div>
            </>
          ) : (
            <>
              <h1>Personalitate unică!</h1>
              <p className="quiz-result-desc">Nu am găsit un stil exact, dar poți explora toate stilurile și crea propriul mix.</p>
              <div className="quiz-nav-btns">
                <Link to="/" className="btn btn-primary btn-lg">Explorează stiluri →</Link>
                <button className="btn btn-ghost" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>Repetă quiz-ul</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Quiz screen ── */
  return (
    <div className="museum-home">
      <Navbar />

      <div className="quiz-wrap">
        {/* Progress bar */}
        <div className="quiz-progress">
          <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <span className="kicker">Întrebarea {step + 1} din {QUESTIONS.length}</span>
        <h2 className="quiz-question">{current.question}</h2>

        <div className="quiz-options">
          {current.options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              className={`quiz-option${answers[current.key] === opt.value ? ' selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="quiz-option-letter">{LETTERS[i]}</span>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: 2 }}>{opt.label}</span>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Înapoi</button>
          ) : (
            <Link to="/" className="btn btn-ghost">Anulează</Link>
          )}
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={loading}
            style={{ minWidth: 160 }}
          >
            {loading ? "Se calculează…" : isLast ? "Descoperă rezultatul →" : "Continuă →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
