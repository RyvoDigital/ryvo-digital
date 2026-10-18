import { Composition, Folder } from "remotion";
import { BrandFilm, FILM_FRAMES } from "./BrandFilm";
import { BEAT } from "./theme";
import { Night } from "./scenes/Night";
import { Intro } from "./scenes/Intro";
import { Moment } from "./scenes/Moment";
import { HowWeWork } from "./scenes/HowWeWork";
import { EndCard } from "./scenes/EndCard";

// 16:10, the MacBook's screen (measured 1.587 : 1 on the render).
const W = 1920, H = 1200, FPS = 30;

export const RemotionRoot = () => (
  <>
    <Composition id="BrandFilm" component={BrandFilm} width={W} height={H} fps={FPS} durationInFrames={FILM_FRAMES} />
    <Folder name="Scenes">
      <Composition id="Night" component={Night} width={W} height={H} fps={FPS} durationInFrames={9 * BEAT} />
      <Composition id="Intro" component={Intro} width={W} height={H} fps={FPS} durationInFrames={8 * BEAT} />
      <Composition id="Moment" component={Moment} width={W} height={H} fps={FPS} durationInFrames={6 * BEAT} defaultProps={{ index: 2, title: "Buyer follow-up", tagline: "Keep close the buyers who are not ready yet." }} />
      <Composition id="HowWeWork" component={HowWeWork} width={W} height={H} fps={FPS} durationInFrames={17 * BEAT} />
      <Composition id="EndCard" component={EndCard} width={W} height={H} fps={FPS} durationInFrames={7 * BEAT} />
    </Folder>
  </>
);
