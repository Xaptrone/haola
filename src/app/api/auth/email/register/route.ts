import { NextResponse } from "next/server";
import { createEmailUser } from "@/lib/email-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try {
    body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      name?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Enter an email and password." }, { status: 400 });
  }

  const result = createEmailUser({
    email: String(body.email ?? ""),
    password: String(body.password ?? ""),
    name: typeof body.name === "string" ? body.name : "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
