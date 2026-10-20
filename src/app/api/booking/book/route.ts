import { NextResponse, after, type NextRequest } from "next/server";
import { RULES, TITLES, bookedTitle } from "@/lib/booking/config";
import { isBookable } from "@/lib/booking/slots";
import { createEvent, freeBusy, mode } from "@/lib/booking/google";
import { allow, validate } from "@/lib/booking/guard";
import { notifyBooking } from "@/lib/booking/notify";

export const dynamic = "force-dynamic";

// POST /api/booking/book → re-checks free/busy (no double booking), then creates
// the event in hello@'s calendar with a Meet link, the guest invited (Google
// emails the invitation: accept, decline or reschedule from it). Once the
// response is sent, hello@ gets one notification email (lib/booking/notify.ts); if that
// fails, the booking still stands.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(`book:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (mode() === "off") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "body" }, { status: 400 }); }
  const v = validate(body);
  // A tripped honeypot gets a quiet success so bots learn nothing.
  if (!v.ok) return v.error === "spam" ? NextResponse.json({ ok: true }) : NextResponse.json({ error: v.error }, { status: 400 });
  const b = v.value;
  if (!allow(`book-email:${b.email}`, 3, 24 * 3_600_000)) return NextResponse.json({ error: "rate" }, { status: 429 });

  try {
    const start = new Date(b.start);
    const end = new Date(start.getTime() + RULES.durationMin * 60_000);
    const busy = await freeBusy(new Date(), new Date(Date.now() + (RULES.horizonDays + 1) * 86_400_000));
    if (!isBookable(b.kind, start.toISOString(), busy)) return NextResponse.json({ error: "taken" }, { status: 409 });

    const extraLabel = b.kind === "automations" ? "Enquiries per month" : "Current website";
    const description = [
      `${TITLES[b.kind]} with Ryvo Digital, booked on ryvodigital.com`,
      "",
      `Name: ${b.name}`,
      `Email: ${b.email}`,
      `Agency / brand: ${b.agency}`,
      `WhatsApp: ${b.whatsapp || "not given"}`,
      `${extraLabel}: ${b.extra || "not given"}`,
      `Site language: ${b.lang.toUpperCase()}${b.tz ? ` · visitor time zone: ${b.tz}` : ""}`,
    ].join("\n");

    const event = await createEvent({
      summary: bookedTitle(b.kind, b.agency),
      description,
      start: start.toISOString(),
      end: end.toISOString(),
      guest: { email: b.email, name: b.name },
    });
    after(() => notifyBooking({ ...b, start: start.toISOString(), meet: event.meet ?? null, eventLink: event.link ?? null }));
    return NextResponse.json({ ok: true, start: start.toISOString(), end: end.toISOString(), meet: event.meet ?? null, mode: mode() });
  } catch (err) {
    console.error("booking failed:", (err as Error).message);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
