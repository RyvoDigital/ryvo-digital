// BOOKING_MOCK=1 swaps in a mock calendar, and only where no real visitor can
// book: in development and on Vercel preview deployments. On Vercel production,
// and under any other production server (`next start`), it is ignored, so a
// stray variable can never take fake bookings on the live site.
export function mockAllowed(env: Record<string, string | undefined>) {
  if (env.BOOKING_MOCK !== "1") return false;
  if (env.VERCEL_ENV === "production") return false;
  return env.NODE_ENV !== "production" || env.VERCEL_ENV === "preview";
}
