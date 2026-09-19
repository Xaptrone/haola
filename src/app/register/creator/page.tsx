import { Suspense } from "react";
import { googleAuthConfigured } from "@/auth";
import { whatsappAuthConfigured } from "@/lib/whatsapp-otp";
import { RegisterCreatorView } from "@/components/auth/RegisterCreatorView";

export const dynamic = "force-dynamic";

export default function RegisterCreatorPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <RegisterCreatorView
        googleConfigured={googleAuthConfigured()}
        whatsappConfigured={whatsappAuthConfigured()}
      />
    </Suspense>
  );
}
