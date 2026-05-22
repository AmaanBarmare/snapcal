// ═════════════════════════════════════════════════════════════════════
//  ✏️  EDIT THIS FILE — this is the only file you normally need to touch
// ═════════════════════════════════════════════════════════════════════

export type Segment = { start: number; end: number };

/**
 * Your cut list.
 *
 * Each entry is a slice of the ORIGINAL recording that you want to KEEP.
 * Times are in SECONDS. Slices play back-to-back, in the order listed.
 * Anything NOT covered by a slice is cut out of the final video.
 *
 * Leave the array EMPTY ([]) to play the whole recording untouched.
 *
 * Example — keep 0–8s, drop 8–15s, keep 15–32s, drop the rest:
 *   export const SEGMENTS: Segment[] = [
 *     { start: 0,  end: 8  },
 *     { start: 15, end: 32 },
 *   ];
 */
export const SEGMENTS: Segment[] = [
  // { start: 0, end: 10 },
];

/** Filename of your phone screen recording — placed in the `public/` folder. */
export const RECORDING_FILE = "DemoScreenRecording.MP4";

/**
 * Filename of your voice-over audio — placed in the `public/` folder.
 * Keep this `null` until you've recorded it, then set e.g. "voiceover.mp3".
 */
export const VOICEOVER_FILE: string | null = null;

/**
 * Keep the recording's own audio (app sounds, taps, ambient noise)?
 * Usually `false` when you're adding a voice-over.
 */
export const KEEP_ORIGINAL_AUDIO = false;

/**
 * Frames per second of the final video. 30 is standard and fine for a demo.
 * Set to 60 only if your recording is 60fps and you want maximum smoothness.
 */
export const FPS = 30;
