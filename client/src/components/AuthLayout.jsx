import { Link } from "react-router-dom";

function AuthLayout({ children, type = "login" }) {
  const copy = {
    login: {
      label: 'Bine ai revenit',
      title: 'Autentificare',
      desc: 'Unde fiecare cameră devine o poveste.',
    },
    register: {
      label: 'Cont nou',
      title: 'Înregistrare',
      desc: 'Creează-ți spațiul personal de inspirație.',
    },
    reset: {
      label: 'Securitate cont',
      title: 'Resetare parolă',
      desc: 'Alege o parolă nouă pentru contul tău Nestify.',
    },
    forgot: {
      label: 'Recuperare cont',
      title: 'Am uitat parola',
      desc: 'Scrie adresa de email asociată contului tău și îți trimitem un link pentru resetare.',
    },
  }[type] || {
    label: 'Cont Nestify',
    title: 'Nestify',
    desc: 'Unde fiecare cameră devine o poveste.',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

      {/* Top editorial strip */}
      <div style={{ borderBottom: '1px solid var(--card-border)', padding: '9px 48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 300, letterSpacing: '0.14em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Vol. I — Interioare, atmosfere, cinematic homes
        </span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link to="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 500, fontStyle: 'italic', letterSpacing: '0.08em', color: 'var(--text)', textDecoration: 'none' }}>
              Nestify
            </Link>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {copy.label}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 500, lineHeight: 1.1, marginBottom: 8, textAlign: 'center' }}>
            {copy.title}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', fontWeight: 300, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 40, lineHeight: 1.7 }}>
            {copy.desc}
          </p>

          {/* Form content */}
          {children}

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← Înapoi la Nestify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
