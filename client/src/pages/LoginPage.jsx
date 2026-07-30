import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
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

function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const message   = new URLSearchParams(location.search).get("message");
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Email sau parolă incorectă.");
    }
    setLoading(false);
  };

  return (
    <AuthLayout type="login">
      {message === "auth-required" && (
        <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--card-border)', padding: '12px 16px', marginBottom: 24, fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          Autentifică-te pentru a accesa această pagină.
        </div>
      )}
      {error && (
        <div style={{ background: '#fdf2f2', border: '1px solid #f5c6c6', padding: '12px 16px', marginBottom: 24, fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#a33', fontWeight: 300 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" placeholder="adresa@email.com" value={form.email} onChange={handleChange} style={fieldStyle}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
            required />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <label style={labelStyle}>Parolă</label>
            <Link to="/forgot-password" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300, textDecoration: 'none' }}>
              Am uitat parola
            </Link>
          </div>
          <PasswordField name="password" placeholder="••••••••" value={form.password} onChange={handleChange} inputStyle={fieldStyle}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
            required />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 8, opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {loading ? 'Se verifică…' : 'Autentificare'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--card-border)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: 'var(--text-muted)' }}>
          Nu ai cont?{' '}
          <Link to="/register" style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--card-border)' }}>
            Înregistrează-te
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
