import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { startCapture } from "@/lib/context/capture-service";
import { selectExtractionModel } from "@/lib/context/extraction/select";
import { listCaptures } from "@/lib/context/projection";
import { failure, getWebPrincipal, unauthorized } from "@/lib/context/web";

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();

const startSchema = z.object({
  question: z.string().trim().min(8).max(500),
  windowStart: day,
  windowEnd: day,
  scopes: z
    .array(
      z.object({
        grantId: z.string().min(1),
        scopeType: z.string().min(1),
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1)
    .max(50),
  permissionsReviewed: z.literal(true),
});

export async function GET() {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  return NextResponse.json({ captures: await listCaptures(prisma, principal) });
}

export async function POST(request: Request) {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  const parsed = startSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Describe what to understand, choose at least one place to look, and confirm what it can read." },
      { status: 400 },
    );
  }
  const input = parsed.data;
  try {
    const result = await startCapture(
      prisma,
      principal,
      {
        question: input.question,
        windowStart: input.windowStart ? new Date(`${input.windowStart}T00:00:00Z`) : null,
        windowEnd: input.windowEnd ? new Date(`${input.windowEnd}T23:59:59Z`) : null,
        scopes: input.scopes,
      },
      selectExtractionModel(),
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return failure(error, "The capture could not be completed.", 422);
  }
}
