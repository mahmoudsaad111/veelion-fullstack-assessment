"use client";

import { useTasksSummary } from "@/hooks/useTasksSummary";
import { RECENT_ACTIVITY_LABEL } from "@/lib/reports";
import { StatCard } from "@/components/reports/StatCard";
import { StatusBreakdown } from "@/components/reports/StatusBreakdown";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export function ReportsDashboard() {
  const { summary, loading, error, retry } = useTasksSummary();

  return (
    <section className="stack">
      <PageHeader title="Reports" description="Where things stand right now." />

      {loading ? <LoadingState label="Loading report..." /> : null}
      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      {!loading && !error && summary ? (
        <>
          <section className="figures" aria-label="Totals">
            <StatCard label="Total tasks" value={summary.total} />
            <StatCard label="Recent activity" value={summary.recentActivityCount} hint={RECENT_ACTIVITY_LABEL} />
          </section>

          {summary.total === 0 ? <p className="empty">No tasks have been created yet.</p> : null}

          <StatusBreakdown summary={summary} />
        </>
      ) : null}
    </section>
  );
}
