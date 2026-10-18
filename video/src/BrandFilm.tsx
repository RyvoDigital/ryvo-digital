import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { Backdrop, Finish, LightLeak } from "./parts";
import { BEAT } from "./theme";
import { lightSweep, mercuryWipe, whip } from "./transitions";
import { Night } from "./scenes/Night";
import { Intro } from "./scenes/Intro";
import { Moment } from "./scenes/Moment";
import { HowWeWork } from "./scenes/HowWeWork";
import { EndCard } from "./scenes/EndCard";

// What Ryvo builds, in about 35 s, silent, looping (round 4). The same story
// and the approved captions as round 3, cut to an imagined 106 bpm (17
// frames a beat): a fast montage for the five, a slower breath for "how we
// work". Ideas are joined, never cut: liquid mercury wipes into and out of
// the five, whip pans between them, a sweep of light into the end card.

const MOMENTS = [
  { title: "Inbound concierge", tagline: "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked." },
  { title: "Contact reactivation", tagline: "Get back in touch with the people who already know you." },
  { title: "Buyer follow-up", tagline: "Keep close the buyers who are not ready yet." },
  { title: "Listing launch", tagline: "One listing, four languages, the legal lines in place." },
  { title: "After the deed", tagline: "A thank-you and a review request, to every client." },
];

// Scene lengths and the transitions between them, in beats.
const S = { night: 9, intro: 8, moment: 6, how: 17, end: 7 };
const T = { mercury: 2, whip: 1, sweep: 1 };
export const FILM_FRAMES = (S.night + S.intro + 5 * S.moment + S.how + S.end - (2 * T.mercury + 5 * T.whip + T.sweep)) * BEAT;

// Where the two mercury wipes start (for the light leaks that ride them).
const WIPE1 = (S.night - T.mercury) * BEAT;
const WIPE2 = (S.night - T.mercury + S.intro - T.whip + 5 * S.moment - 4 * T.whip - T.mercury) * BEAT;

export const BrandFilm = () => (
  <AbsoluteFill>
    <Backdrop />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={S.night * BEAT}><Night /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={mercuryWipe()} timing={linearTiming({ durationInFrames: T.mercury * BEAT })} />
      <TransitionSeries.Sequence durationInFrames={S.intro * BEAT}><Intro /></TransitionSeries.Sequence>
      {MOMENTS.flatMap((m, i) => [
        <TransitionSeries.Transition key={`t${i}`} presentation={whip()} timing={linearTiming({ durationInFrames: T.whip * BEAT })} />,
        <TransitionSeries.Sequence key={`m${i}`} durationInFrames={S.moment * BEAT}><Moment index={i} {...m} /></TransitionSeries.Sequence>,
      ])}
      <TransitionSeries.Transition presentation={mercuryWipe()} timing={linearTiming({ durationInFrames: T.mercury * BEAT })} />
      <TransitionSeries.Sequence durationInFrames={S.how * BEAT}><HowWeWork /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={lightSweep()} timing={linearTiming({ durationInFrames: T.sweep * BEAT })} />
      <TransitionSeries.Sequence durationInFrames={S.end * BEAT}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <LightLeak at={WIPE1 - 6} dur={3 * BEAT} from="left" seed="a" />
    <LightLeak at={WIPE2 - 6} dur={3 * BEAT} from="right" seed="b" />
    <LightLeak at={FILM_FRAMES - 7 * BEAT} dur={3 * BEAT} from="left" seed="c" />
    <Finish />
  </AbsoluteFill>
);
