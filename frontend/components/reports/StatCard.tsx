type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="figure">
      <p className="figure__label">{label}</p>
      <p className="figure__value">{value}</p>
      {hint ? <p className="figure__hint">{hint}</p> : null}
    </div>
  );
}
