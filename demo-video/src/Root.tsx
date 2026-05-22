import "./index.css";
import { Composition, staticFile } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { Demo } from "./Demo";
import { getVideoMetadata } from "./get-video-metadata";
import { FPS, RECORDING_FILE, SEGMENTS } from "./config";

// Used only if the recording file is missing, so the Studio still opens.
const PLACEHOLDER = { width: 1080, height: 1920, durationInSeconds: 10 };

// Auto-sizes the composition to the recording and sets its length to the
// sum of the kept segments (or the whole video if no cuts are defined).
const calculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  let meta = PLACEHOLDER;
  try {
    meta = await getVideoMetadata(staticFile(RECORDING_FILE));
  } catch {
    console.warn(
      `[demo-video] public/${RECORDING_FILE} not found — opening with a ` +
        `${PLACEHOLDER.width}x${PLACEHOLDER.height} placeholder. ` +
        `Add your recording to the public/ folder, then reload.`,
    );
  }

  const keptSeconds =
    SEGMENTS.length > 0
      ? SEGMENTS.reduce((sum, s) => sum + (s.end - s.start), 0)
      : meta.durationInSeconds;

  return {
    width: meta.width,
    height: meta.height,
    fps: FPS,
    durationInFrames: Math.max(1, Math.round(keptSeconds * FPS)),
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={300}
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetadata}
    />
  );
};
