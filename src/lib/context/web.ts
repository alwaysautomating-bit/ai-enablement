import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { principalForUser } from "@/lib/context/principal";
import { ensureSampleContextData } from "@/lib/context/sample-data";

// Web principal resolution. Until Auth.js lands (roadmap Phase 0) the local app acts as
// the sample user; AIEW_DEV_USER switches to another sample user to test boundaries.
// Replacing this function with a session lookup is the only change real sign-in needs.
export async function getWebPrincipal() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development sign-in is disabled in production.");
  }
  await ensureSampleContextData(prisma);
  return principalForUser(prisma, process.env.AIEW_DEV_USER ?? "user_laura", "WEB");
}

export function unauthorized() {
  return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
}

export function failure(error: unknown, fallback: string, status = 400) {
  const message = error instanceof Error && ["CaptureInputError", "ReviewError", "ScopeRefusedError"].includes(error.name)
    ? error.message
    : fallback;
  return NextResponse.json({ error: message }, { status });
}
