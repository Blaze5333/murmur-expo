# Murmur

A clean Expo chat screen with restrained message animation, a keyboard-aware composer, and local history.

[Live demo](https://murmur-voice-demo.vercel.app) · [Screen capture](https://murmur-voice-demo.vercel.app/demo/murmur-demo.mp4) · [GIF](https://murmur-voice-demo.vercel.app/demo/murmur-demo.gif)

![Chat preview](public/demo/murmur-desktop.png)

## Run with Bun

    bun install --frozen-lockfile
    bun run web

Use Node 24.22.1 or newer. For native, use bun run start, bun run ios, or bun run android. No API keys are required. Replies and voice transcription are scripted. History stays on the device until explicitly cleared.

## Verify and record

    bun run check
    bun run build:web
    bunx playwright install webkit
    bun run test:e2e
    bun run record
    bun run build:web

The browser suite covers Chrome mobile/desktop and WebKit. Keyboard geometry is simulated; physical-device verification is separate. Recording uses installed Chrome and FFmpeg to capture the actual screen. Rebuild after recording to include updated media in dist.

[Project overview](PROJECT_OVERVIEW.md) documents architecture and verification. [Recruiter walkthrough](RECRUITER_WALKTHROUGH.md) explains the code and tradeoffs.

## Publish

The folder is linked to the permanent Vercel project. Run bunx --bun vercel --prod to use the Bun/Expo configuration in vercel.json. Keep all local environment and authentication files ignored.
