import Link from "next/link";
import { OversightShell } from "@/components/shells/OversightShell";

export default function ManagerOversightPage() {
  return (
    <OversightShell title="Queue">
      <div className="grid gap-4 lg:grid-cols-3">
        <Metric href="/work/review" label="Needs review" value="2" />
        <Metric href="/oversight/manager" label="Campaign health" value="4 live" />
        <Metric href="/oversight/manager" label="QC fails" value="1" />
      </div>
      <ul className="mt-8 space-y-3">
        <li>
          <Link
            href="/work/review"
            className="block rounded-[16px] border border-line bg-surface p-4"
          >
            <p className="font-medium">Mei Lin · As I Am tasting reel</p>
            <p className="mt-1 text-sm text-muted">Disclosure missing · predicted QC</p>
          </Link>
        </li>
        <li>
          <Link
            href="/work/review"
            className="block rounded-[16px] border border-line bg-surface p-4"
          >
            <p className="font-medium">Mei Lin · SOOD lunch hook</p>
            <p className="mt-1 text-sm text-muted">Outlet price scope unclear</p>
          </Link>
        </li>
      </ul>
    </OversightShell>
  );
}

function Metric({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="rounded-[16px] border border-line bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
    </Link>
  );
}
