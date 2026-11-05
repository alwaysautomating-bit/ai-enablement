import { NextResponse } from "next/server";
import { approveRun } from "@/lib/run-service";

export async function POST(_request: Request, context: { params: Promise<{ runId: string }> }) {
  const { runId } = await context.params;
  try {
    return NextResponse.json({ run: await approveRun(runId) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed." },
      { status: 409 },
    );
  }
}
