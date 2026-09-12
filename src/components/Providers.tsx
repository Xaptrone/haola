"use client";

import { SessionProvider } from "@/lib/session";
import { MarketplaceProvider } from "@/lib/marketplace";
import { RoleSwitcher } from "@/components/demo/RoleSwitcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketplaceProvider>
      <SessionProvider>
        {children}
        <RoleSwitcher />
      </SessionProvider>
    </MarketplaceProvider>
  );
}
