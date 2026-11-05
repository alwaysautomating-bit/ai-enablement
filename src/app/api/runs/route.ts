import { NextResponse } from "next/server";
import { z } from "zod";
import { createResearchRun, listRuns } from "@/lib/run-service";

const sourceSchema = z.object({
  sourceKey: z.string().min(1),
  name: z.string().min(1),
  detail: z.string().min(1),
  quality: z.string().min(1),
  origin: z.string().min(1),
});

const createRunSchema = z.object({
  question: z.string().trim().min(10),
  audience: z.string().trim().min(2),
  priority: z.string().trim().min(2),
  sources: z.array(sourceSchema).min(1),
});

export async function GET() {
  return NextResponse.json({ runs: await listRuns() });
}

export async function POST(request: Request) {
  const parsed = createRunSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the brief and select at least one source." }, { status: 400 });
  }
  return NextResponse.json({ run: await createResearchRun(parsed.data) }, { status: 201 });
}
