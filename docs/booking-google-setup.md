# Booking on hello@'s Google Calendar: one-time setup

The site's own booking UI reads hello@ryvodigital.com's free/busy times,
creates the event (with a Google Meet link, the guest invited, Google sending
the invitation) and emails hello@ about the booking. It needs one Google OAuth
credential. You place every secret
by hand, only in `.env.local` and in Vercel; nothing is printed, logged or
committed.

**Why this option:** a refresh token for hello@, from an *Internal* OAuth app,
is the simplest secure choice for one Workspace mailbox. It needs no admin-wide
delegation, it asks only for three narrow scopes, and Internal apps do not have
the 7-day token expiry that external "testing" apps have. It keeps working
until it is revoked, or after about 6 months of not being used at all.

## 1. Google Cloud project (5 minutes)

1. Go to https://console.cloud.google.com/ signed in as **hello@ryvodigital.com**.
2. Top bar → project picker → **New project**. Name: `ryvo-website-booking`. Create it and select it.
3. **APIs & Services → Library**. Search **Google Calendar API** → **Enable**.
4. Same place: search **Gmail API** → **Enable**. Without it, bookings still work but the notification email to hello@ fails (logged as `booking email failed: gmail 403`).

## 2. Consent screen (Internal)

1. **APIs & Services → OAuth consent screen** (also called **Google Auth Platform → Branding / Audience**).
2. **User type: Internal**. This makes it usable only by accounts in ryvodigital.com.
3. App name: `Ryvo website booking`. Support email and developer contact: hello@ryvodigital.com. Save.
4. **Data access / Scopes → Add scopes**: add exactly these three:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.freebusy`
   - `https://www.googleapis.com/auth/gmail.send` (send only: it cannot read the mailbox)

## 3. OAuth client

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. **Application type: Desktop app**. Name: `ryvo-booking-token`. Create.
3. Copy the **Client ID** and **Client secret** into `~/ryvo-website/.env.local`, by hand:

   ```
   GOOGLE_OAUTH_CLIENT_ID=…
   GOOGLE_OAUTH_CLIENT_SECRET=…
   BOOKING_CALENDAR_ID=hello@ryvodigital.com
   ```

## 4. Get the refresh token (local script)

From `~/ryvo-website`:

```
node scripts/google-calendar-token.mjs
```

1. A browser opens Google's consent screen. Sign in as **hello@ryvodigital.com** and allow.
2. The script saves `GOOGLE_OAUTH_REFRESH_TOKEN` into `.env.local` and prints only "Saved … (not shown)".

A token made before `gmail.send` was added (before 20 Oct 2026) does not cover the email: run the script again, allow the three scopes, and replace `GOOGLE_OAUTH_REFRESH_TOKEN` in Vercel by hand too.

## 5. Turn it on

1. In `.env.local`, remove `BOOKING_MOCK=1`. That line is what makes the review build use a test calendar.
2. Restart the local server: `npm run build && npm run start`. Booking a call now creates a real event in hello@'s calendar, so test with your own email.
3. In **Vercel → Project → Settings → Environment Variables** (Production and Preview), add by hand:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_OAUTH_REFRESH_TOKEN`
   - `BOOKING_CALENDAR_ID` = `hello@ryvodigital.com`

   Then redeploy. Do **not** add `BOOKING_MOCK` in Vercel.

## What the site does with it

- **Free times.** It reads free/busy for the next 4 weeks.
- **Offered times.** It offers 30-minute slots inside the published hours (`src/lib/booking/config.ts`, Europe/Madrid), with:
  - a 12-hour minimum notice;
  - 4 weeks ahead at most;
  - a 15-minute buffer around existing events.
- **Booking.** It re-checks free/busy at the moment of booking, so the same time can't be booked twice. It then creates the event with a Meet link, `sendUpdates=all`, the guest as attendee, and the form answers in the description.
- **Notification email.** Once the guest has their confirmation, the site sends one email from hello@ to hello@ through the Gmail API (`users.messages.send`, same token). Subject: `New booking · Automations · Tue 21 Oct, 19:30 · Guest name` (Madrid time). It holds the call type, the date and time in Madrid (and in the guest's own zone when that differs), the guest's name and email, every form answer, the Meet link, a link to the calendar event, and the page language (EN/PT/ES). `Reply-To` is the guest, so replying writes to them. If the email fails, the booking still stands; the server logs only the reason (`booking email failed: gmail 500`), never the guest's details. With `BOOKING_MOCK=1` the message is built and checked but never sent. `npm run check:booking-email` builds the exact message and writes previews to `.review/step2/booking-email/`.
- **If Google can't be reached** (or credentials are missing), visitors get a button to the public Google booking page instead.

## To revoke

Google Account (hello@) → **Security → Third-party connections → Ryvo website booking → Remove access**, or delete the OAuth client in Cloud Console.
