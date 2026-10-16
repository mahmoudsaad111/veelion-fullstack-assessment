import type { TaskFilter } from "@/types/api";

const FILTERS: Array<{ label: string; value: TaskFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

type StatusFilterProps = {
  value: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (value: TaskFilter) => void;
};

export function StatusFilter({ value, counts, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter tasks by status" className="filters">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className="filters__option"
          onClick={() => onChange(filter.value)}
          aria-pressed={filter.value === value}
        >
          {filter.label}
          {/* Keep the visual count separate from the filter label. */}
          <span className="filters__count" aria-hidden="true">
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
