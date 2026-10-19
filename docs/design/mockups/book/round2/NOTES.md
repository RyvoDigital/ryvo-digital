# /book · round 2 · the final version (built into /[lang]/book)

Manuel's pick (19 Oct 2026): A's structure, B's look.

- Two panes: B's intro on the left (the large "Let's talk." rising out of its mask, the sub,
  a mono line with 30 minutes · Google Meet and live Lisbon/Madrid clocks), with "What happens
  next" below it; on the right one glass card holding call, week, days and both runs of times at
  once, the form in place. At 1440×900 the card ends at 759 px (picker), 701 (form), 685 (booked).
- Days: B's ruler of light numerals; the chosen one in chrome over a mercury tick.
- Booked: B's ticket, inside the card; the mercury line on the card's top edge settles flat.
- The chrome object is removed: shown whole it pushed the card below the fold at 1440×900, and
  behind the card it always clipped. The card reads against a mercury bloom instead.
- Kept: mercury progress line, morning/evening runs with taken times struck, Lisbon/Madrid time
  for the chosen slot, loading/empty/error states with the Google booking page as fallback,
  "Prefer to write?" with copy, a still version under reduced motion.

Files: src/app/[lang]/book/page.tsx → src/components/book/BookPage.tsx (+ .module.css),
useBooking.ts (Book.tsx's logic copied as is), Mercury.tsx, shared.tsx. The homepage's
Book.tsx is untouched. /lab/book-a and /lab/book-b are deleted.
Development only: ?state=loading|error|empty|form|done (ignored in production).

Copy added to src/i18n/pages.ts (book), EN/PT/ES: with (the people on each call), steps,
next + nextSteps, write, copy, copied, cities, duration, where. No existing copy changed.
