# Application submission

**Paste this in the field labeled “Vercel link” (the assignment accepts a GIF uploaded somewhere shareable):**

https://raw.githubusercontent.com/Blaze5333/murmur-expo/main/public/demo/murmur-demo.gif

**MP4 screen capture:** https://github.com/Blaze5333/murmur-expo/blob/main/public/demo/murmur-demo.mp4

**Repository:** https://github.com/Blaze5333/murmur-expo

## Suggested description

I built Murmur, a small voice-chat interaction in Expo using TypeScript and Reanimated. It moves from a breathing microphone orb to a listening waveform, unfolding transcript, thinking indicator, and animated reply. The focus was keeping the motion calm and the transitions continuous. The demo supports typed prompts, cancellation, replay, and reduced motion. It uses a scripted conversation so anyone can try the complete experience without microphone permissions or an API key.

## Hosting status

The GIF is permanently hosted in the public repository and its direct URL was verified to return HTTP 200. The MP4 is 12.67 seconds at 780×1688 / 30 fps. The recording captures the actual Expo web screen.

An interactive web export is ready and can be run with `bun run preview`. Vercel configuration is included; publish a durable Vercel version after signing in with `bunx --bun vercel login` and running `bunx --bun vercel --prod` from the project root.

The temporary Vercel URL https://fast-quasar-1vvc8i5.tmp.now reports ready but returns HTTP 403 from this environment and expires on 13 November 2026 at 7:46 AM IST unless claimed. Do not submit it without resolving and verifying access. The claim link is intentionally excluded from public source because it grants ownership.

GitHub Pages setup is included as a manual workflow. GitHub rejected its first run before build steps because the account is locked due to a billing issue; the owner must resolve that account issue before Pages can deploy.
