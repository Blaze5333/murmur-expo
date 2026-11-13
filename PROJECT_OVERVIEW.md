# Murmur — project overview

Last updated: 2026-11-13 (Asia/Kolkata).

## Purpose and boundaries

A standalone job-application exercise: “In Expo, build one small screen with a genuinely polished animation or transition,” record a short capture, and share it. The requested submission field is labeled “Vercel link.” The user specifically requested Bun and this overview for future context.

This is a new project, separate from `/Users/mustafa/bliq-mobo-v2`. No Bliq source, environment values, backend connections, or credentials belong here. The native screen is the deliverable; the desktop frame presents that screen for browser reviewers.

## Experience

**Murmur:** a calm voice-chat concept. Warm paper, forest green, sage, locally bundled DM Sans and Instrument Serif. An illuminated, slowly breathing microphone orb anchors the screen.

1. Idle: a welcome bubble, three prompt chips, a text composer, and a breathing orb.
2. Listening: expanding rings, a smoothly varying waveform, elapsed time, and word-by-word scripted transcription.
3. Thinking: the user's message enters, a dot travels around the orb, and three staggered dots signal a response.
4. Responding: a reply bubble appears with a spring transition and words stream in.
5. Complete: the orb shows a check; tap it to try again or reset from the header.

The footer demo label is static; its tappable green info popup was removed at the user’s request so it cannot cover the composer. The voice sequence is a clearly labeled simulation; it never requests microphone access. Text input and suggestions use small deterministic local replies, without an AI service. This makes the exercise reproducible and free of accounts, keys, network latency, and message persistence.

## Stack and commands

- Expo SDK 58 / React Native 0.88 / TypeScript.
- Bun 1.3.14 with `bun.lock`; no other lockfiles.
- Reanimated 4 / Worklets for transforms, opacity, spring entrances, loops, and layout transitions.
- Expo LinearGradient, Font, and optional native Haptics; Lucide SVG icons.
- Expo web export and Vercel config for a shareable browser build.
- Playwright against installed Google Chrome; FFmpeg for capture conversion.

`bun run check` runs type checking and lint. `bun run build:web` produces `dist/`. `bun run test:e2e` checks the production web build. `bun run record` creates the screen capture; rebuild afterward to publish it. `bun run preview` serves the exported build on port 4173.

## Source map

- `App.tsx`: bundled fonts, safe area, status bar.
- `src/Showcase.tsx`: responsive desktop presentation; narrow web and native render the screen directly.
- `src/screens/ConversationScreen.tsx`: screen composition, message transitions, input, suggestions, reset, and demo disclosure.
- `src/hooks/useConversation.ts`: state machine and one cancellable timeline; all timers are cleared on reset and unmount; a synchronous busy guard prevents duplicate sends.
- `src/components/VoiceOrb.tsx`: breathing light, active ripples, orbiting thinking indicator, action button.
- `src/components/Waveform.tsx`: deterministic waveform and staggered thinking dots.
- `src/components/Touch.tsx`: spring press feedback without layout movement.
- `src/theme.ts`: shared palette and typography.
- `scripts/record.ts`: reproducible portrait recording and screenshots.
- `tests/conversation.spec.ts`: full flow, repeat cancellation, duplicate-send prevention, suggestions, and reduced motion.
- `vercel.json`: Bun install, web build, and static output.
- `app.config.ts`: optional `MURMUR_BASE_PATH` for repository-subpath hosting; native and Vercel use the root.
- `.github/workflows/pages.yml`: manual Pages publishing with Bun, available after the account billing lock is resolved.
- `SUBMISSION.md`: verified recording/repository links and a short application description.

## Motion decisions

Prefer transforms and opacity over per-frame layout changes. Orb breathing: 2400 ms in each direction. Listening ripples: 2600 ms with 850 ms separation. Waveform: 1350 ms deterministic phase. Simulated speech: starts after 650 ms, advances every 370 ms, completes at 4700 ms. Thinking: 1850 ms. Reply: one word every 58 ms. Bubble entrances use a damped spring; content layout changes use a 220–320 ms transition.

Respect the system reduced-motion preference: stop ambient loops and waveform movement, use short fades in place of spring entrances. Controls have accessibility labels, disabled/busy state, and a polite status announcement. Native haptics are optional and failures are ignored. Demo output is not represented as actual audio transcription or generated AI.

## Verification and sharing status

Implementation is complete. Final local project: `/Users/mustafa/murmur-expo` (a sibling of Bliq, with its own Git repository).

- Footer info popup removed and redeployed at the user’s request. Verified on the public site at 390px and 1440px: clicking the static demo label creates no popup and the composer remains in view. Lint, type checking, and the web export passed after this change.
- `bun run check`: passed (application and tooling TypeScript checks plus ESLint).
- `bun run build:web`: passed; only the six used local fonts are exported.
- `bun run test:e2e`: all 8 checks passed across mobile Chromium and desktop Chrome. Covered the full timeline, three consecutive cancellations with no delayed replies, typed input and duplicate-send protection, prompt suggestions, reduced motion, horizontal overflow, and composer visibility.
- Visually inspected mobile idle, mobile reply, and desktop screenshots.
- Recorded 739 rendered browser frames with Chrome DevTools screencasting and encoded a valid 12.67-second H.264 MP4 at 780×1688 / 30 fps plus a looping 390-pixel-wide GIF. The capture is of the Expo web app, not a native simulator. Final files are in `public/demo/` and included in the exported web build.
- Clean `bun install --frozen-lockfile`: passed. Both iOS and Android native JavaScript/Hermes exports passed. Native device execution has **not** been verified on this machine; Xcode's simulator tooling is unavailable.
- Permanent Vercel production: https://murmur-voice-demo.vercel.app (owned by `mustafachaiwala2003-6618`, project `murmur-voice-demo`). The local folder is linked to this project; future `bunx --bun vercel --prod` deployments use the same project.
- Public app, `/demo/murmur-demo.mp4`, and `/demo/murmur-demo.gif` all verified to return HTTP 200 without authentication. Verified a full prompt/reply interaction in unauthenticated Chrome with no browser errors.
- GitHub repository: https://github.com/Blaze5333/murmur-expo (public, pushed). Recording copies remain committed there.
- The old anonymous Vercel preview has expired and should no longer be shared. Use the permanent production URL above.
- Optional GitHub Pages workflow remains manual-only because the GitHub account has an Actions billing lock. Vercel is the active host; Pages is not needed for submission.
- Vercel CLI stores local project/authentication state in ignored `.vercel/` and `.env.local`. Do not commit or print their contents.

Maintain this section after changes. Do not represent a temporary preview as permanent or imply that browser checks also verified native devices.

## Future work

For this exercise, keep the single-screen scope. Real speech recognition, microphone permissions, real AI, persistence, authentication, and multi-screen navigation are deliberately outside the implementation. If later requested, replace the simulation behind `useConversation` while keeping its cancellation contract and visual states.
