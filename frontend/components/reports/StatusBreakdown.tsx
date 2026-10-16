import { getPercentage, STATUS_LABELS, STATUS_ORDER } from "@/lib/reports";
import type { TasksSummary } from "@/types/api";

type StatusBreakdownProps = {
  summary: TasksSummary;
};

export function StatusBreakdown({ summary }: StatusBreakdownProps) {
  const spokenSummary = STATUS_ORDER.map(
    (status) => `${STATUS_LABELS[status]} ${summary.byStatus[status]}`
  ).join(", ");

  return (
    <section className="report-section" aria-labelledby="status-heading">
      <h2 id="status-heading">Tasks by status</h2>

      {/* The bar is only a picture of the numbers below, so screen readers get the sentence instead. */}
      <div className="status-bar" role="img" aria-label={`Tasks by status: ${spokenSummary}`}>
        {STATUS_ORDER.filter((status) => summary.byStatus[status] > 0).map((status) => (
          // flexGrow is the one inline style: the width depends on the data.
          <span
            key={status}
            className="status-bar__segment"
            data-status={status}
            style={{ flexGrow: summary.byStatus[status] }}
          />
        ))}
      </div>

      <ul className="status-legend">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="status-legend__item">
            <span className="status-legend__swatch" data-status={status} aria-hidden="true" />
            <span>{STATUS_LABELS[status]}</span>
            <span className="status-legend__count">{summary.byStatus[status]}</span>
            <span className="status-legend__share">{getPercentage(summary.byStatus[status], summary.total)}%</span>
          </li>
        ))}
      </ul>

      {/* Tasks only have completed or not, so "In progress" is part of the API contract but is always 0. */}
      <p className="report-note">
        No task can be in progress yet. A task is either completed or not, so every open task counts as To do.
      </p>
    </section>
  );
}
