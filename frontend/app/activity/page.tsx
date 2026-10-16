"use client";

import { useActivity } from "@/hooks/useActivity";
import { formatActivityTime } from "@/lib/activity";
import { formatRelativeTime } from "@/lib/dates";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ActivityPage() {
  const { activity, visibleActivity, query, setQuery, loading, error, retry } = useActivity();

  return (
    <main className="stack">
      <PageHeader title="Activity Feed" description="Search the log by action or details." />

      <input
        className="input"
        type="search"
        placeholder="Search activity"
        aria-label="Search activity"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {loading ? <LoadingState label="Loading activity..." /> : null}
      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      {!loading && !error ? (
        <>
          <p className="activity-summary">
            Showing {visibleActivity.length} of {activity.length} {activity.length === 1 ? "entry" : "entries"}
          </p>

          <section className="panel">
            {visibleActivity.length === 0 ? (
              <p className="empty">
                {activity.length === 0 ? "No activity yet." : "No activity matches your search."}
              </p>
            ) : (
              <ul className="activity-list">
                {visibleActivity.map((item) => (
                  <li key={item.id} className="activity-item">
                    <div>
                      <p className="activity-item__action">{item.action || "(no action)"}</p>
                      <p className="activity-item__info">{item.info || "(no info)"}</p>
                    </div>
                    <time className="activity-item__time" dateTime={item.when} title={formatActivityTime(item.when)}>
                      {formatRelativeTime(item.when)}
                    </time>
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
