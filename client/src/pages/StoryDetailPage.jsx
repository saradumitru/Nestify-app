import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";

const getImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

const getSourceHref = (url) => {
  const value = String(url || "").trim();
  if (!value) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return null;

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : value.startsWith("//")
      ? `https:${value}`
      : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

export default function StoryDetailPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/api/stories/${id}`)
      .then(r => setStory(r.data))
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", padding: "120px 0" }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "120px 48px" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "2.5rem", marginBottom: 16 }}>Articolul nu a fost găsit.</h1>
          <Link to="/stories" style={{ fontFamily: "Inter,sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none", borderBottom: "1px solid var(--card-border)" }}>← Înapoi la povești</Link>
        </div>
      </div>
    );
  }

  const sourceHref = getSourceHref(story.sourceUrl);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      {/* Hero image */}
      {story.imageUrl && (
        <div style={{ width: "100%", height: 480, overflow: "hidden", background: "var(--cream-dark)" }}>
          <img
            src={getImageSrc(story.imageUrl)}
            alt={story.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* Content area */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "60px 48px 100px" }}>

        {/* Back link */}
        <Link
          to="/stories"
          style={{ fontFamily: "Inter,sans-serif", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", textDecoration: "none", borderBottom: "1px solid var(--card-border)", paddingBottom: 2, display: "inline-block", marginBottom: 48 }}
        >
          ← Înapoi la povești
        </Link>

        {/* Kicker */}
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
          {story.kicker || "Popular"}
        </p>

        {/* Title */}
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 500, lineHeight: 1.1, margin: "0 0 28px", color: "var(--text)" }}>
          {story.title}
        </h1>

        {/* Excerpt */}
        {story.excerpt && (
          <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.18rem", fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36, borderBottom: "1px solid var(--card-border)", paddingBottom: 36 }}>
            {story.excerpt}
          </p>
        )}

        {/* Byline */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.1em", margin: 0 }}>
            {new Date(story.publishedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {story.author && (
            <>
              <span style={{ color: "var(--card-border)" }}>·</span>
              <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.1em", margin: 0 }}>
                {story.author}
              </p>
            </>
          )}
          {story.readTime && (
            <>
              <span style={{ color: "var(--card-border)" }}>·</span>
              <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.1em", margin: 0 }}>
                {story.readTime} citire
              </p>
            </>
          )}
        </div>

        {/* Content */}
        {story.content && (
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: "0.95rem", lineHeight: 1.9, color: "var(--text)", whiteSpace: "pre-line" }}>
            {story.content}
          </div>
        )}

        {/* Source link */}
        {sourceHref && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--card-border)" }}>
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "Inter,sans-serif", fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--text)", paddingBottom: 2 }}
            >
              Citește articolul complet →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
