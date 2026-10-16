import { NextResponse, type NextRequest } from "next/server";
import { KINDS, RULES, type Kind } from "@/lib/booking/config";
import { availableSlots } from "@/lib/booking/slots";
import { freeBusy, mode } from "@/lib/booking/google";
import { allow } from "@/lib/booking/guard";

export const dynamic = "force-dynamic";

// GET /api/booking/slots?kind=automations → { slots: [ISO…], mode }
export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind") as Kind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "kind" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(`slots:${ip}`, 60, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (mode() === "off") return NextResponse.json({ error: "unavailable" }, { status: 503 });
  try {
    const now = new Date();
    const busy = await freeBusy(now, new Date(now.getTime() + (RULES.horizonDays + 1) * 86_400_000));
    return NextResponse.json(
      { slots: availableSlots(kind, busy, now), timeZone: RULES.timeZone, mode: mode() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("booking slots failed:", (err as Error).message);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
