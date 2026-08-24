import Link from "next/link";

export function ActionFeed({
  items,
}: {
  items: { id: string; title: string; detail: string; href: string }[];
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted">Nothing needs you right now.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="block rounded-[16px] border border-line bg-surface p-4 transition-[border-color] duration-[var(--duration-ui)] ease-[var(--ease-out)] hover:border-ink/20"
          >
            <p className="text-[16px] font-medium text-ink">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.detail}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
