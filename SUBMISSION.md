# Application submission

**Vercel link — paste this into the application:**

https://murmur-voice-demo.vercel.app

**13-second screen capture:** https://murmur-voice-demo.vercel.app/demo/murmur-demo.mp4

**Looping GIF:** https://murmur-voice-demo.vercel.app/demo/murmur-demo.gif

**Repository:** https://github.com/Blaze5333/murmur-expo

## Suggested description

I built Murmur, a small voice-chat interaction in Expo using TypeScript and Reanimated. It moves from a breathing microphone orb to a listening waveform, unfolding transcript, thinking indicator, and animated reply. The focus was keeping the motion calm and the transitions continuous. The demo supports typed prompts, cancellation, replay, and reduced motion. It uses a scripted conversation so anyone can try the complete experience without microphone permissions or an API key.

## Verification

The permanent Vercel app, MP4, and GIF were verified to open publicly without sign-in. A prompt/reply interaction passed in unauthenticated Chrome with no browser errors. The MP4 captures the actual Expo web screen: 12.67 seconds at 780×1688 / 30 fps. The repository also retains copies of the recordings.

## Future deployments

The project folder is linked to the owner’s Vercel project `murmur-voice-demo`. From this folder run `bunx --bun vercel --prod`. The tracked `vercel.json` builds the Expo source using Bun and publishes `dist/`.

The previous anonymous preview has expired. Use the permanent URL above.
