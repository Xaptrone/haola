import Link from "next/link";

export function OversightShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-line p-6 lg:block">
        <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Haola
        </p>
        <nav className="space-y-1 text-sm">
          <Link className="block rounded-[10px] bg-elevated px-3 py-2 text-ink" href="/oversight/manager">
            Queue
          </Link>
          <Link className="block px-3 py-2 text-muted hover:text-ink" href="/oversight/business">
            Business
          </Link>
          <Link className="block px-3 py-2 text-muted hover:text-ink" href="/oversight/creator">
            Creators
          </Link>
        </nav>
      </aside>
      <div>
        <header className="border-b border-line px-5 py-4 lg:px-8">
          <h1 className="text-lg font-medium text-ink">{title}</h1>
        </header>
        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
