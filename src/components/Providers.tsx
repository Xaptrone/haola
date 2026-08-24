"use client";

import { SessionProvider } from "@/lib/session";
import { RoleSwitcher } from "@/components/demo/RoleSwitcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <RoleSwitcher />
    </SessionProvider>
  );
}
