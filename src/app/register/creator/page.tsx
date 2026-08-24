"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session";

export default function RegisterCreatorPage() {
  const { registerCreator } = useSession();
  const router = useRouter();
  const [name, setName] = useState("Aisha");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Creator studio
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">
        Your canvas is empty on purpose.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        We provision a studio, then ask what you want to make. No profile wall.
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-8 min-h-14 rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
      />
      <Button
        className="mt-6 min-h-14 w-full"
        onClick={() => {
          registerCreator(name || "Creator", "creator@haola.my");
          router.push("/work/studio");
        }}
      >
        Open blank canvas
      </Button>
    </div>
  );
}
