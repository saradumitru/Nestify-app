import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

const fieldStyle = {
  width: "100%",
  padding: "12px 0",
  border: "none",
  borderBottom: "1px solid var(--card-border)",
  background: "transparent",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.92rem",
  fontWeight: 300,
  color: "var(--text)",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.62rem",
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: 6,
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      setSuccess(response.data.message);
      setResetUrl(response.data.resetUrl || "");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Eroare la trimiterea emailului.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout type="forgot">
      {error && (
        <div style={{ background: "#fdf2f2", border: "1px solid #f5c6c6", padding: "12px 16px", marginBottom: 24, fontFamily: "Inter, sans-serif", fontSize: "0.83rem", color: "#a33", fontWeight: 300, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "var(--cream-dark)", border: "1px solid var(--card-border)", padding: "12px 16px", marginBottom: 24, fontFamily: "Inter, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>{success}</p>
          {resetUrl && (
            <a href={resetUrl} style={{ display: "block", marginTop: 8, color: "var(--text)", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid var(--card-border)", width: "fit-content" }}>
              Deschide linkul de resetare
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="adresa@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={fieldStyle}
            onFocus={(event) => {
              event.target.style.borderBottomColor = "var(--text)";
            }}
            onBlur={(event) => {
              event.target.style.borderBottomColor = "var(--card-border)";
            }}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "15px", background: "var(--text)", color: "var(--cream)", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 8, opacity: isSubmitting ? 0.6 : 1, transition: "opacity 0.2s" }}>
          {isSubmitting ? "Se trimite..." : "Trimite link de resetare"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--card-border)" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", fontWeight: 300, color: "var(--text-muted)" }}>
          Ți-ai amintit parola?{" "}
          <Link to="/login" style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid var(--card-border)" }}>
            Autentifică-te
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
