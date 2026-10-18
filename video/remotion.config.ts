import { Config } from "@remotion/cli/config";

// Rendering uses a local Chrome when REMOTION_CHROME points at one (this Mac
// could not reach remotion.media to download Chrome Headless Shell), e.g.
// REMOTION_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
