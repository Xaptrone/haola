"use client";

import { Suspense } from "react";
import { SessionProvider as NextAuthProvider, useSession as useAuth } from "next-auth/react";
import { MarketplaceProvider } from "@/lib/marketplace";
import { SessionProvider } from "@/lib/session";
import { RoleSwitcher } from "@/components/demo/RoleSwitcher";

function Bridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const user = auth.data?.user;
  const identity =
    auth.status === "authenticated" && user?.email
      ? {
          id: user.id || user.email,
          email: user.email,
          name: user.name || user.email,
          image: user.image,
          manager: user.manager,
        }
      : null;

  return (
    <MarketplaceProvider>
      <SessionProvider identity={identity} authReady={auth.status !== "loading"}>
        {children}
        <Suspense fallback={null}>
          <RoleSwitcher />
        </Suspense>
      </SessionProvider>
    </MarketplaceProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <Bridge>{children}</Bridge>
    </NextAuthProvider>
  );
}
