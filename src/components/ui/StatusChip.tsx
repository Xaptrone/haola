export function StatusChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "action" | "ok" | "warn" | "bad";
}) {
  const map = {
    neutral: "text-muted border-line",
    action: "text-accent border-accent/30",
    ok: "text-sage border-sage/30",
    warn: "text-warn border-warn/30",
    bad: "text-rose border-rose/30",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${map}`}
    >
      {children}
    </span>
  );
}
