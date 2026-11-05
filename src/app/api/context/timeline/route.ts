import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEntityTimeline } from "@/lib/context/projection";
import { getWebPrincipal, unauthorized } from "@/lib/context/web";

export async function GET(request: Request) {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  const entity = new URL(request.url).searchParams.get("entity");
  if (!entity) return NextResponse.json({ error: "Choose an entity." }, { status: 400 });
  const timeline = await getEntityTimeline(prisma, principal, entity);
  if (!timeline) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(timeline);
}
