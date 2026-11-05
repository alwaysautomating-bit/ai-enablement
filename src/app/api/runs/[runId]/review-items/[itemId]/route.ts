import { NextResponse } from "next/server";
import { z } from "zod";
import { setReviewItem } from "@/lib/run-service";

const reviewSchema = z.object({ acknowledged: z.boolean() });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ runId: string; itemId: string }> },
) {
  const { runId, itemId } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review update." }, { status: 400 });
  }
  try {
    return NextResponse.json({ run: await setReviewItem(runId, itemId, parsed.data.acknowledged) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review update failed." },
      { status: 409 },
    );
  }
}
