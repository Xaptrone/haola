import Link from "next/link";

export type NavItem = {
  href: string;
  label: string;
  key: string;
  badge?: number;
  primary?: boolean;
};

export function BottomNav({
  items,
  active,
  contained = false,
}: {
  items: NavItem[];
  active: string;
  contained?: boolean;
}) {
  return (
    <nav
      className={
        contained
          ? "absolute inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95"
          : "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      }
      style={contained ? undefined : { paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid grid-cols-5 px-2 pt-2">
        {items.map((item) => {
          const on = active === item.key;
          return (
            <li key={item.key} className="flex justify-center">
              <Link
                href={item.href}
                className={`relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 text-[10px] tracking-wide ${
                  item.primary
                    ? "-mt-5 h-14 w-14 rounded-full bg-accent text-canvas"
                    : on
                      ? "text-ink"
                      : "text-muted"
                }`}
              >
                {item.primary ? (
                  <span className="text-lg leading-none">+</span>
                ) : (
                  <span
                    className={`h-1 w-1 rounded-full ${on ? "bg-accent" : "bg-transparent"}`}
                  />
                )}
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-canvas">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
