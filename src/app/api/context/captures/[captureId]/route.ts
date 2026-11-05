import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaptureView } from "@/lib/context/projection";
import { getWebPrincipal, unauthorized } from "@/lib/context/web";

export async function GET(_request: Request, context: { params: Promise<{ captureId: string }> }) {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  const { captureId } = await context.params;
  const capture = await getCaptureView(prisma, principal, captureId);
  if (!capture) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ capture });
}
