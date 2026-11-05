import { NextResponse } from "next/server";
import { capabilityRecord } from "@/lib/context/permissions";
import { CONTEXT_CAPTURE_CAPABILITY, loadLock } from "@/lib/context/pork";
import { getWebPrincipal, unauthorized } from "@/lib/context/web";

export async function GET() {
  const principal = await getWebPrincipal();
  if (!principal) return unauthorized();
  const record = capabilityRecord(CONTEXT_CAPTURE_CAPABILITY);
  return NextResponse.json({ capability: { ...record, same: loadLock().same.contract } });
}
