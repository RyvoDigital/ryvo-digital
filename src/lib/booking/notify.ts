import "server-only";
import { buildBookingEmail, checkMime, toBase64Url, type BookingEmailInput } from "./email";
import { mode, sendMail } from "./google";

// Tells hello@ about a booking, after the event exists. Never throws: a failed
// email must never fail a booking the guest has already been shown. Logs carry
// the reason only, never the guest's details or a credential.
export async function notifyBooking(b: BookingEmailInput): Promise<"sent" | "mock" | "failed"> {
  try {
    const msg = buildBookingEmail(b);
    const problem = checkMime(msg.raw, { replyTo: b.email });
    if (problem) { console.error(`booking email not sent: ${problem}`); return "failed"; }
    if (mode() === "mock") { console.info("booking email (mock): built and checked, not sent"); return "mock"; }
    await sendMail(toBase64Url(msg.raw));
    return "sent";
  } catch (err) {
    console.error(`booking email failed: ${(err as Error).message}`);
    return "failed";
  }
}
