import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from "../components/AuthLayout";
import api from '../services/api';
import PasswordField from "../components/PasswordField";

const fieldStyle = {
  width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid var(--card-border)',
  background: 'transparent', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.92rem',
  fontWeight: 300, color: 'var(--text)', transition: 'border-color 0.2s',
};
const labelStyle = {
  fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)',
  display: 'block', marginBottom: 6,
};

function RegisterPage() {
  const navigate  = useNavigate();
  const [form,      setForm]      = useState({ name: '', email: '', password: '' });
  const [isDesigner, setIsDesigner] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        ...form,
        role: isDesigner ? 'DESIGNER' : 'USER',
      });
      setSuccess('Cont creat cu succes! Redirecționare…');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la crearea contului.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout type="register">
      {error && (
        <div style={{ background: '#fdf2f2', border: '1px solid #f5c6c6', padding: '12px 16px', marginBottom: 24, fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#a33', fontWeight: 300 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--card-border)', padding: '12px 16px', marginBottom: 24, fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <label style={labelStyle}>Nume</label>
          <input name="name" placeholder="Numele tău" value={form.name} onChange={handleChange} style={fieldStyle}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
            required />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" placeholder="adresa@email.com" value={form.email} onChange={handleChange} style={fieldStyle}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
            required />
        </div>
        <div>
          <label style={labelStyle}>Parolă</label>
          <PasswordField name="password" placeholder="Minim 6 caractere" value={form.password} onChange={handleChange} inputStyle={fieldStyle}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
            required />
        </div>

        {/* Designer toggle */}
        <div
          onClick={() => setIsDesigner(p => !p)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
            padding: '16px', border: `1px solid ${isDesigner ? 'var(--text)' : 'var(--card-border)'}`,
            background: isDesigner ? 'var(--cream-dark)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 18, height: 18, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${isDesigner ? 'var(--text)' : 'var(--card-border)'}`,
            background: isDesigner ? 'var(--text)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {isDesigner && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
              Sunt designer de interior
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Vei putea adăuga portofoliu, detalii despre experiență și date de contact pentru clienți.
            </p>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 8, opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {loading ? 'Se creează contul…' : 'Înregistrare'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--card-border)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: 'var(--text-muted)' }}>
          Ai deja cont?{' '}
          <Link to="/login" style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--card-border)' }}>
            Autentifică-te
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
