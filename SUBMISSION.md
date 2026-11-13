# Application submission

**Vercel link — paste this into the application:**

https://murmur-voice-demo.vercel.app

**10-second screen capture:** https://murmur-voice-demo.vercel.app/demo/murmur-demo.mp4

**Looping GIF:** https://murmur-voice-demo.vercel.app/demo/murmur-demo.gif

**Repository:** https://github.com/Blaze5333/murmur-expo

## Suggested description

I built Murmur, an Expo chat screen focused on interaction quality: subtle message entrances, a responsive composer, typing feedback, and smooth scrolling. Conversations are saved locally and restored after refresh. The mobile layout follows the visible viewport so the keyboard does not cover the composer. I kept the code small and separated conversation state, storage, rendering, and viewport handling. Replies and the voice preview are scripted, keeping the demo easy to review without API keys.

## Verification

The redesign passed 15 checks across mobile Chrome, desktop Chrome, and WebKit. These cover persistence, keyboard-style viewport resizing and focus, history scrolling, cancellation, storage errors, and reduced motion. Lint, type checking, and web/iOS/Android bundle exports passed. Physical iPhone keyboard verification is still separate. The new recording captures the actual Expo web app at 780×1688 / 30fps for 10.17 seconds.

## Future deployments

The project folder is linked to the owner’s Vercel project `murmur-voice-demo`. From this folder run `bunx --bun vercel --prod`. The tracked `vercel.json` builds the Expo source using Bun and publishes `dist/`.

The previous anonymous preview has expired. Use the permanent URL above.
