import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listSourceOptions } from "@/lib/context/sample-data";
import { getWebPrincipal, unauthorized } from "@/lib/context/web";

export async function GET() {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  return NextResponse.json({ sources: await listSourceOptions(prisma, principal.userId) });
}
