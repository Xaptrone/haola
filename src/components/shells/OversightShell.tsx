import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PreviewMenu } from "@/components/demo/RoleSwitcher";

const links = [
  { key: "queue", href: "/oversight/manager", label: "Queue" },
  { key: "brand-ip", href: "/oversight/manager?tab=brand-ip", label: "Brand IP" },
  { key: "credits", href: "/oversight/manager?tab=credits", label: "Credits" },
  { key: "business", href: "/oversight/business", label: "Business" },
  { key: "creator", href: "/oversight/creator", label: "Creators" },
] as const;

export function OversightShell({
  title,
  children,
  active = "queue",
}: {
  title: string;
  children: React.ReactNode;
  active?: (typeof links)[number]["key"];
}) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-line p-6 lg:block">
        <div className="mb-8">
          <BrandLogo href="/oversight/manager" height={22} />
        </div>
        <nav className="space-y-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.key}
              className={
                active === link.key
                  ? "block rounded-[10px] bg-elevated px-3 py-2 text-ink"
                  : "block px-3 py-2 text-muted hover:text-ink"
              }
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:px-8">
          <h1 className="text-lg font-medium text-ink">{title}</h1>
          <div className="flex items-center gap-4">
            <PreviewMenu />
            <SignOutButton />
          </div>
        </header>
        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
