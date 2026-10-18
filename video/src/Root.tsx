import { Composition, Folder } from "remotion";
import { BrandFilm, FILM_BEATS } from "./BrandFilm";
import { BEAT } from "./theme";
import { Night } from "./scenes/Night";
import { Intro } from "./scenes/Intro";
import { Automation } from "./scenes/Automation";
import { Statement } from "./scenes/Statement";
import { EndCard } from "./scenes/EndCard";

// 16:10, the MacBook's screen (measured 1.587 : 1 on the render).
const W = 1920, H = 1200, FPS = 30;

export const RemotionRoot = () => (
  <>
    <Composition id="BrandFilm" component={BrandFilm} width={W} height={H} fps={FPS} durationInFrames={FILM_BEATS * BEAT} />
    <Folder name="Scenes">
      <Composition id="Night" component={Night} width={W} height={H} fps={FPS} durationInFrames={9 * BEAT} />
      <Composition id="Intro" component={Intro} width={W} height={H} fps={FPS} durationInFrames={8 * BEAT} />
      <Composition id="Automation" component={Automation} width={W} height={H} fps={FPS} durationInFrames={6 * BEAT} defaultProps={{ index: 0, motion: "pop", title: "Inbound concierge", tagline: "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked." }} />
      <Composition id="Statement" component={Statement} width={W} height={H} fps={FPS} durationInFrames={4 * BEAT} defaultProps={{ label: "HOW WE WORK", lines: ["Price and negotiation", "always stay with your team."] }} />
      <Composition id="EndCard" component={EndCard} width={W} height={H} fps={FPS} durationInFrames={7 * BEAT} />
    </Folder>
  </>
);
