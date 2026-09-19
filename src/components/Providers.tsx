"use client";

import { useMemo } from "react";
import { SessionProvider as NextAuthProvider, useSession as useAuth } from "next-auth/react";
import { MarketplaceProvider } from "@/lib/marketplace";
import { SessionProvider, type AuthIdentity } from "@/lib/session";

function Bridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const user = auth.data?.user;
  const identity = useMemo<AuthIdentity | null>(() => {
    if (auth.status !== "authenticated" || !user?.email) return null;
    return {
      id: user.id || user.email,
      email: user.email,
      name: user.name || user.email,
      image: user.image,
      manager: user.manager,
    };
  }, [auth.status, user?.id, user?.email, user?.name, user?.image, user?.manager]);

  return (
    <MarketplaceProvider>
      <SessionProvider identity={identity} authReady={auth.status !== "loading"}>
        {children}
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
