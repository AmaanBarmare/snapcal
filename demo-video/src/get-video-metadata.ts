import { ALL_FORMATS, Input, UrlSource } from "mediabunny";

export type VideoMetadata = {
  width: number;
  height: number;
  durationInSeconds: number;
};

/**
 * Reads the dimensions and duration of a video file using Mediabunny.
 * Used by `calculateMetadata` so the composition auto-matches the recording.
 */
export const getVideoMetadata = async (
  src: string,
): Promise<VideoMetadata> => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, { getRetryDelay: () => null }),
  });

  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) {
    throw new Error(`No video track found in ${src}`);
  }

  return {
    width: videoTrack.displayWidth,
    height: videoTrack.displayHeight,
    durationInSeconds: await input.computeDuration(),
  };
};
