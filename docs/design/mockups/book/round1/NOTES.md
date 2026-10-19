# /book · round 1 · two directions

Open: `cd ~/ryvo-website-book && npx next dev -p 3004`, then
localhost:3004/lab/book-a and localhost:3004/lab/book-b (dev only, 404 in production).
Query: `?lang=pt|es`, `?kind=websites`, `?state=loading|error|empty|form|done`.
To book through to the confirmation, set `BOOKING_MOCK=1` in this worktree's .env.local
(removed at the end of round 1); without it the slots come from the real calendar
(read only) and a booking would be real.

- **A · The instrument**: two panes. Left: "Let's talk.", the sub, 30 minutes · Google Meet ·
  Lisbon/Madrid clocks, and a "What happens next" rail. Right: one smoked-glass card over a
  mercury glow and the chrome speech bubble (01-concierge) holding the whole booking: call
  tiles with a pearl, the week, pill times in two runs, the form in place. The mercury line on
  the card's top edge is the progress, and on booking it settles dead flat with one sheen.
- **B · The concierge**: one centred column in big type. Three questions asked one at a time
  (Which call? / When suits you? / Who are we meeting?); each folds into a one-line summary
  with Change. A vertical mercury rail carries a bead of light down; the end is the page's only
  glass, the confirmation ticket, with the settled mercury line. Days as a numeral ruler, large
  pill times, underline fields.

Booking logic: `src/components/lab/book/useBooking.ts` is Book.tsx's logic copied as is (same
API calls, grouping, week pages, request body, error handling). Round 2 should move Book.tsx
onto the same hook so there is one copy.

New labels (in `labels.ts` for now; to `src/i18n/pages.ts` in round 2), EN/PT/ES:
"With Manuel or Martim" / "With Manuel or Phil"; steps Call · Time · Details; the three
questions; "What happens next" + 3 lines (from the existing doneBody); "Prefer to write?" +
Copy/Copied; Lisbon/Madrid; "30 minutes"; "Google Meet"; "of" (01 of 03).
No existing copy was changed.
