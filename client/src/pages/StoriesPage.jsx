import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";

const getImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/stories")
      .then(r => setStories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      {/* Editorial strip */}
      <div style={{ borderBottom: "1px solid var(--card-border)", padding: "9px 48px", background: "var(--cream)" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 300, letterSpacing: "0.14em", color: "var(--text-muted)", fontStyle: "italic" }}>
          Vol. III — Povești recente
        </span>
      </div>

      {/* Page header */}
      <div style={{ padding: "64px 48px 48px", borderBottom: "1px solid var(--card-border)" }}>
        <span style={{ fontFamily: "Inter,sans-serif", fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 10 }}>Arhiva editorială</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(2.4rem,5vw,4.2rem)", fontWeight: 500, lineHeight: 0.96, margin: 0 }}>Povești recente</h1>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.88rem", color: "var(--text-muted)", marginTop: 18, maxWidth: 520, lineHeight: 1.85, fontWeight: 300 }}>
          Articole editoriale despre design interior, case cu poveste și interioare care inspiră.
        </p>
      </div>

      {/* Stories grid */}
      <div style={{ padding: "56px 48px 80px" }}>
        {loading ? (
          <div className="loading-spinner" />
        ) : stories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.4rem", color: "var(--text-muted)" }}>Niciun articol adăugat încă.</p>
            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 8 }}>Revino curând pentru povești noi.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 36 }}>
            {stories.map(story => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                {/* Image */}
                <div style={{ height: 240, overflow: "hidden", background: "var(--cream-dark)", marginBottom: 18 }}>
                  {story.imageUrl
                    ? <img
                        src={getImageSrc(story.imageUrl)}
                        alt={story.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    : <div style={{ width: "100%", height: "100%", background: "var(--beige)" }} />
                  }
                </div>

                {/* Kicker */}
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
                  {story.kicker || "Popular"}
                </p>

                {/* Title */}
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.35rem", lineHeight: 1.25, margin: "0 0 10px", color: "var(--text)" }}>
                  {story.title}
                </h2>

                {/* Excerpt */}
                {story.excerpt && (
                  <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                    {story.excerpt.slice(0, 140)}{story.excerpt.length > 140 ? "…" : ""}
                  </p>
                )}

                {/* Date */}
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 14, letterSpacing: "0.08em" }}>
                  {new Date(story.publishedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
