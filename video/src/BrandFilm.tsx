import { AbsoluteFill, Track } from "remotion";
import { Backdrop } from "./parts";
import { BEAT } from "./theme";
import { Night } from "./scenes/Night";
import { Intro } from "./scenes/Intro";
import { Automation } from "./scenes/Automation";
import { Statement } from "./scenes/Statement";
import { EndCard } from "./scenes/EndCard";

// What Ryvo builds, in 35 s, silent, looping. Every caption is the site's own
// copy; the two that are new or shortened are listed for approval in
// docs/design/mockups/automations/round3/README.md. Every scene boundary sits
// on a beat (15 frames at 30 fps): 70 beats in all.
export const FILM_BEATS = 70;

export const BrandFilm = () => (
  <AbsoluteFill>
    <Backdrop />
    <Track name="Scenes">
      <Night name="1 · The night" durationInFrames={9 * BEAT} />
      <Intro name="2 · Five automations" from={9 * BEAT} durationInFrames={8 * BEAT} />
      <Automation name="3 · 01" from={17 * BEAT} durationInFrames={6 * BEAT} index={0} motion="pop" title="Inbound concierge" tagline="Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked." />
      <Automation name="3 · 02" from={23 * BEAT} durationInFrames={6 * BEAT} index={1} motion="turn" title="Contact reactivation" tagline="Get back in touch with the people who already know you." />
      <Automation name="3 · 03" from={29 * BEAT} durationInFrames={6 * BEAT} index={2} motion="slide" title="Buyer follow-up" tagline="Keep close the buyers who are not ready yet." />
      <Automation name="3 · 04" from={35 * BEAT} durationInFrames={6 * BEAT} index={3} motion="fan" title="Listing launch" tagline="One listing, four languages, the legal lines in place." />
      <Automation name="3 · 05" from={41 * BEAT} durationInFrames={6 * BEAT} index={4} motion="descend" title="After the deed" tagline="A thank-you and a review request, to every client." />
      <Statement name="4 · Adapted" from={47 * BEAT} durationInFrames={4 * BEAT} label="HOW WE WORK" lines={["We adapt each one to how", "your agency already works."]} />
      <Statement name="4 · Retainer" from={51 * BEAT} durationInFrames={4 * BEAT} label="HOW WE WORK" lines={["We run it for you", "on a monthly retainer."]} />
      <Statement name="4 · Your team" from={55 * BEAT} durationInFrames={4 * BEAT} label="HOW WE WORK" lines={["Price and negotiation", "always stay with your team."]} />
      <Statement name="4 · Disclosed" from={59 * BEAT} durationInFrames={4 * BEAT} label="HOW WE WORK" lines={["It always says", "it is an AI."]} />
      <EndCard name="5 · RYVO" from={63 * BEAT} durationInFrames={7 * BEAT} />
    </Track>
  </AbsoluteFill>
);
