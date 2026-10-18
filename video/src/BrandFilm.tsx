import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { Backdrop, Finish, LightLeak } from "./parts";
import { SEC } from "./theme";
import { lightSweep, mercuryWipe, whip } from "./transitions";
import { Night } from "./scenes/Night";
import { Intro } from "./scenes/Intro";
import { Moment } from "./scenes/Moment";
import { HOW_SECONDS, HowWeWork } from "./scenes/HowWeWork";
import { EndCard } from "./scenes/EndCard";

// What Ryvo builds, about a minute, silent, looping (round 6: slower, at 60
// fps). The same story and the approved captions. Every caption stays long
// enough to read calmly: at least 0.4 s a word plus 1 s, never under 2.5 s.
// Ideas are joined, never cut: liquid mercury wipes into and out of the five,
// whip pans between them, a sweep of light into the end card.

const MOMENTS = [
  { title: "Inbound concierge", tagline: "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked.", seconds: 8.6 },
  { title: "Contact reactivation", tagline: "Get back in touch with the people who already know you.", seconds: 7.0 },
  { title: "Buyer follow-up", tagline: "Keep close the buyers who are not ready yet.", seconds: 6.4 },
  { title: "Listing launch", tagline: "One listing, four languages, the legal lines in place.", seconds: 6.4 },
  { title: "After the deed", tagline: "A thank-you and a review request, to every client.", seconds: 6.4 },
];

// Scene lengths and the transitions between them, in seconds.
export const FPS = 60;
const S = { night: 5.8, intro: 6.2, how: HOW_SECONDS, end: 4.6 };
const T = { mercury: 1.2, whip: 0.7, sweep: 0.8 };
const f = (s: number) => SEC(s, FPS);
const MOMENT_FRAMES = MOMENTS.reduce((a, m) => a + f(m.seconds), 0);
export const FILM_FRAMES = f(S.night) + f(S.intro) + MOMENT_FRAMES + f(S.how) + f(S.end) - (2 * f(T.mercury) + 5 * f(T.whip) + f(T.sweep));

// Where the two mercury wipes start (for the light leaks that ride them).
const WIPE1 = f(S.night) - f(T.mercury);
const WIPE2 = WIPE1 + f(S.intro) - f(T.whip) + MOMENT_FRAMES - 4 * f(T.whip) - f(T.mercury);

export const BrandFilm = () => (
  <AbsoluteFill>
    <Backdrop />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={f(S.night)}><Night /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={mercuryWipe()} timing={linearTiming({ durationInFrames: f(T.mercury) })} />
      <TransitionSeries.Sequence durationInFrames={f(S.intro)}><Intro /></TransitionSeries.Sequence>
      {MOMENTS.flatMap((m, i) => [
        <TransitionSeries.Transition key={`t${i}`} presentation={whip()} timing={linearTiming({ durationInFrames: f(T.whip) })} />,
        <TransitionSeries.Sequence key={`m${i}`} durationInFrames={f(m.seconds)}><Moment index={i} {...m} /></TransitionSeries.Sequence>,
      ])}
      <TransitionSeries.Transition presentation={mercuryWipe()} timing={linearTiming({ durationInFrames: f(T.mercury) })} />
      <TransitionSeries.Sequence durationInFrames={f(S.how)}><HowWeWork /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={lightSweep()} timing={linearTiming({ durationInFrames: f(T.sweep) })} />
      <TransitionSeries.Sequence durationInFrames={f(S.end)}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <LightLeak at={WIPE1 - f(0.2)} dur={f(2)} from="left" seed="a" />
    <LightLeak at={WIPE2 - f(0.2)} dur={f(2)} from="right" seed="b" />
    <LightLeak at={FILM_FRAMES - f(S.end)} dur={f(2)} from="left" seed="c" />
    <Finish />
  </AbsoluteFill>
);
