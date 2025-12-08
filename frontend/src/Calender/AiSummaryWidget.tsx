import React, { useEffect, useState } from "react";
import { getStoredAuthSession } from "../Login/auth";

const AiSummaryWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = getStoredAuthSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session) {
        headers["Authorization"] = `Bearer ${session.token}`;
      }

      const res = await fetch("/api/summarize", { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed (${res.status})`);
      }
      const txt = await res.text();
      setContent(txt.trim());
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch AI summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !content && !loading && !error) {
      void fetchSummary();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button
        className="ai-fab"
        type="button"
        aria-label="Open AI summary"
        onClick={() => setOpen((o) => !o)}
      >
        AI
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <span>Weekly summary</span>
            <button className="ai-close" onClick={() => setOpen(false)} aria-label="Close AI summary">✕</button>
          </div>
          <div className="ai-panel-body">
            {loading && <div>Loading summary…</div>}
            {error && <div className="ai-error">{error}</div>}
            {!loading && !error && (
              <pre className="ai-content">
                {content || "No summary returned."}
              </pre>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiSummaryWidget;
