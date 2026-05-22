import { AbsoluteFill, Series, staticFile, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import {
  KEEP_ORIGINAL_AUDIO,
  RECORDING_FILE,
  SEGMENTS,
  VOICEOVER_FILE,
} from "./config";

/**
 * The demo video.
 *
 * - The video track is built from `SEGMENTS` (see config.ts): each kept slice
 *   of the recording is trimmed out and the slices play back-to-back.
 * - The voice-over, if set, plays as one continuous track over the result.
 *
 * Everything is driven by config.ts — you should not need to edit this file.
 */
export const Demo: React.FC = () => {
  const { fps } = useVideoConfig();
  const muted = !KEEP_ORIGINAL_AUDIO;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SEGMENTS.length === 0 ? (
        // No cuts defined — play the whole recording untouched.
        <Video src={staticFile(RECORDING_FILE)} muted={muted} />
      ) : (
        // Play each kept segment one after another.
        <Series>
          {SEGMENTS.map((seg, i) => (
            <Series.Sequence
              key={i}
              durationInFrames={Math.max(
                1,
                Math.round((seg.end - seg.start) * fps),
              )}
              premountFor={fps}
            >
              <Video
                src={staticFile(RECORDING_FILE)}
                trimBefore={Math.round(seg.start * fps)}
                trimAfter={Math.round(seg.end * fps)}
                muted={muted}
              />
            </Series.Sequence>
          ))}
        </Series>
      )}

      {VOICEOVER_FILE ? <Audio src={staticFile(VOICEOVER_FILE)} /> : null}
    </AbsoluteFill>
  );
};
