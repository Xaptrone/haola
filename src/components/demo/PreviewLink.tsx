"use client";

import Link from "next/link";
import { previewSurfacesEnabled } from "@/lib/preview";

export function PreviewLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!previewSurfacesEnabled()) return null;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
