import { OversightShell } from "@/components/shells/OversightShell";

export default function BusinessPerformancePage() {
  return (
    <OversightShell title="Business performance">
      <p className="text-sm text-muted">
        Oversight only. Work happens in the workspace, not here.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[16px] border border-line bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Approvals waiting
          </p>
          <p className="mt-3 text-2xl font-medium">2</p>
        </div>
        <div className="rounded-[16px] border border-line bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Live campaigns
          </p>
          <p className="mt-3 text-2xl font-medium">1</p>
        </div>
        <div className="rounded-[16px] border border-line bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Spend this month
          </p>
          <p className="mt-3 text-2xl font-medium">RM 4,200</p>
        </div>
      </div>
    </OversightShell>
  );
}
