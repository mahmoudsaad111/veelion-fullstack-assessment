"use client";

import Link from "next/link";
import { useActivity } from "@/hooks/useActivity";
import { formatActivityTime } from "@/lib/activity";

export default function ActivityPage() {
  const { activity, visibleActivity, query, setQuery, loading, error, retry } = useActivity();

  return (
    <main className="stack">
      <nav>
        <Link href="/" className="button">
          Back
        </Link>
      </nav>

      <section className="card" style={{ padding: "1rem" }}>
        <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Activity Feed</h1>

        <input
          className="input"
          placeholder="Search activity"
          aria-label="Search activity"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {loading ? (
        <section className="card" style={{ padding: "1rem" }} role="status">
          <p style={{ margin: 0 }}>Loading activity...</p>
        </section>
      ) : null}

      {error ? (
        <section
          className="card"
          style={{ padding: "1rem", borderColor: "#e3b4c0", background: "#fff8fa" }}
          role="alert"
        >
          <p style={{ marginTop: 0, marginBottom: "0.75rem", color: "var(--danger)" }}>{error}</p>
          <button type="button" className="button" onClick={retry}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="card" style={{ padding: "1rem" }}>
            <small style={{ color: "var(--muted)" }}>
              Total: {activity.length} | Visible: {visibleActivity.length}
            </small>
          </section>

          <section className="card" style={{ padding: "1rem" }}>
            {visibleActivity.length === 0 ? (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {activity.length === 0 ? "No activity yet." : "No activity matches your search."}
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.7rem" }}>
                {visibleActivity.map((item) => (
                  <li key={item.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.6rem" }}>
                    <div style={{ fontWeight: 600 }}>{item.action || "(no action)"}</div>
                    <div>{item.info || "(no info)"}</div>
                    <small style={{ color: "var(--muted)" }}>
                      <time dateTime={item.when}>{formatActivityTime(item.when)}</time>
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
