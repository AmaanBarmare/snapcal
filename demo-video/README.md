# SnapCal demo video

Edits the phone screen recording (trim/cut segments) and lays a voice-over on
top, then renders a final MP4 — all driven by one config file.

## One-time setup

Already done: `npm i` has run and `@remotion/media` + `mediabunny` are
installed. If you ever move this folder, run `npm i` again.

## Step 1 — add your recording

Drop your phone screen recording into the `public/` folder and name it
`recording.mp4` (or update `RECORDING_FILE` in [src/config.ts](src/config.ts)).
`.mov` files from iPhone work too — just point `RECORDING_FILE` at the name.

## Step 2 — preview

```bash
npm run dev
```

Opens Remotion Studio at http://localhost:3000. The composition auto-sizes
itself to your recording's resolution. Scrub the timeline to find your cut
points (note the timestamps in **seconds**).

## Step 3 — trim / cut

Open [src/config.ts](src/config.ts) and fill in `SEGMENTS` with the slices you
want to **keep**. They play back-to-back; gaps between them are cut out:

```ts
export const SEGMENTS: Segment[] = [
  { start: 0,  end: 8  },   // keep 0s–8s
  { start: 15, end: 32 },   // skip to 15s, keep 15s–32s
];
```

Leave it `[]` to keep the whole recording. Studio hot-reloads as you edit.

## Step 4 — record the voice-over

Lock your cuts first, then record the voice-over **while watching the trimmed
preview** so it matches the final timing. Tip: render a draft (Step 5) and
play it back while you record.

Save the audio into `public/` (e.g. `voiceover.mp3`), then in `config.ts`:

```ts
export const VOICEOVER_FILE: string | null = "voiceover.mp3";
```

The recording's own audio is muted by default while a voice-over is used — set
`KEEP_ORIGINAL_AUDIO = true` in `config.ts` if you want app sounds kept.

## Step 5 — render the final MP4

```bash
npx remotion render Demo out/snapcal-demo.mp4
```

Output lands in `out/`.

## Files

| File | What it is |
|------|------------|
| `src/config.ts` | **The only file you edit** — cut list, filenames, fps |
| `src/Demo.tsx` | Builds the video from the config (no need to touch) |
| `src/Root.tsx` | Registers the composition, auto-sizes it to the recording |
| `src/get-video-metadata.ts` | Reads the recording's size/length |
| `public/` | Put `recording.mp4` and `voiceover.mp3` here |
| `out/` | Rendered videos land here |

## Want more than trimming?

Remotion can also add zoom-on-tap, captions, callouts, and intro/outro cards.
Ask and those can be layered into `Demo.tsx`.
