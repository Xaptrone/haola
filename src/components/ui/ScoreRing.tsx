export function ScoreRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--haola-line)"
          strokeWidth="4"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--haola-accent)"
          strokeWidth="4"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text
          x="36"
          y="40"
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 14, fontFamily: "var(--font-jb)", fontWeight: 500 }}
        >
          {value}
        </text>
      </svg>
      <div>
        <p className="text-sm text-ink">{label}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          Predicted
        </p>
      </div>
    </div>
  );
}
