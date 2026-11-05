import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { reviewAssertion } from "@/lib/context/review-service";
import { failure, getWebPrincipal, unauthorized } from "@/lib/context/web";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

const reviewSchema = z.object({
  decision: z.enum(["CONFIRM", "CORRECT", "NOT_USEFUL"]),
  visibility: z.enum(["OWNER", "SOURCE_AUDIENCE"]),
  note: z.string().max(1000).optional(),
  correction: z
    .object({
      statement: z.string().trim().min(3).max(1000).optional(),
      effectiveFrom: date,
      effectiveTo: date,
    })
    .optional(),
});

export async function POST(request: Request, context: { params: Promise<{ assertionId: string }> }) {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  const { assertionId } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a decision." }, { status: 400 });
  try {
    return NextResponse.json(await reviewAssertion(prisma, principal, assertionId, parsed.data));
  } catch (error) {
    return failure(error, "The decision could not be saved.", 409);
  }
}
