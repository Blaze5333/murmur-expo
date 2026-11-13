# Murmur — project overview

Updated 13 November 2026 (Asia/Kolkata).

## Purpose

A standalone Expo animation exercise for a job application. The user requested Bun, a separate project, a maintained overview, a clean professional design with stronger typography, correct keyboard/focus behavior, automatic scrolling, locally saved history, and understandable code to explain to a recruiter.

Local folder: /Users/mustafa/murmur-expo. Repository: https://github.com/Blaze5333/murmur-expo.
Production: https://murmur-voice-demo.vercel.app. This is separate from Bliq. Never copy Bliq credentials or environment files here.

## Current design

A white chat workspace with charcoal user bubbles, blue action/focus states, system typography, and a compact header. Strong headings and 16px message/input text replace the earlier serif hero and large gradient orb. Desktop centers an 820px workspace; mobile fills its visible viewport. The green popup and old decorative components are removed.

Three prompts start the empty conversation. Every exchange remains in the history. A typing indicator covers the scripted reply delay. The microphone opens a compact simulated voice preview, with a waveform and transcript. Replies and transcription are deterministic demo data, without an AI or speech service.

## Source map

- App.tsx: safe area and status bar; no font-loading dependency.
- src/Showcase.tsx: responsive workspace.
- src/components/Viewport.web.tsx: browser viewport/input CSS. Tracks visualViewport height and offsetTop on resize/scroll using requestAnimationFrame, keeping the app above Safari’s keyboard.
- src/components/Viewport.tsx: native flex wrapper.
- src/screens/ConversationScreen.tsx: header, history, scrolling, voice tray, clear action, and native KeyboardAvoidingView. Web keyboard adjustment is handled only by the viewport wrapper.
- src/components/Composer.tsx: multiline 16px input, blue wrapper focus border, no inner browser outline, Enter/Shift+Enter handling, send/stop/mic. Sending retains focus.
- src/components/MessageBubble.tsx: memoized bubbles, timestamps, and 220ms opacity/8px translation via shared values. No layout-detaching entrance/exit builders. Restored history stays still; reduced motion uses opacity only.
- src/hooks/useConversation.ts: hydration, append-only exchanges, reply delay, voice timers, cancellation, duplicate-send guard, and persistence status.
- src/storage/chatStorage.ts: versioned validated snapshots with serialized writes. AsyncStorage uses localStorage on web and native storage on iOS/Android.
- src/types/chat.ts: message type and stable ID creation.
- src/components/Waveform.tsx: voice waveform and typing dots.
- tests/conversation.spec.ts: Chrome mobile/desktop and WebKit tests for persistence, resized viewport/focus, scroll restoration, cancellation/clear, storage errors, and reduced motion.
- scripts/record.ts: actual rendered browser capture, MP4/GIF conversion, and screenshots.

## State and storage

Load saved history before accepting input. Each message has an ID, role, text, and timestamp. Append the user message immediately, then the complete scripted reply after 1250ms. Save on message changes; do not serialize waveform/transcript frames. Serialize writes so older asynchronous writes cannot overwrite newer history. The key is murmur.chat.v2, snapshot version 1. No count limit or automatic history trimming is applied.

Clear requires an explicit user confirmation and cancels pending work. Canceling a voice preview or reply preserves existing messages. A storage failure leaves chat usable in memory and shows an honest error. Messages never leave the device.

## Scroll and keyboard rules

Follow new content when already near the bottom, and always after the user sends. Scroll after measurement and recheck the follow flag inside the scheduled frame so a queued scroll cannot override new user intent. The latest-message shortcut makes an immediate long-distance jump, while short new-message scrolls are animated. Preserve the reading position when the user scrolls up, with a Latest messages shortcut. The composer participates in flex layout above the keyboard. Its input uses 16px type to avoid iPhone focus zoom.

A ScrollView keeps variable-height history restoration simple and reliable for this small single-conversation exercise. A production history of thousands of messages should use pagination and a virtualized list.

## Commands and verification

Use Bun only: bun install --frozen-lockfile, bun run check, bun run build:web, bun run test:e2e, bun run record, bun run preview.
Chrome must be installed; bunx playwright install webkit adds the Safari test engine.

Redesign verification: all 15 browser checks passed across mobile Chrome, desktop Chrome, and Safari/WebKit. Lint and application/tooling TypeScript checks passed. The web export and both iOS/Android Hermes bundle exports passed. Visually reviewed the empty and multi-message layouts; the new MP4 is 10.17 seconds at 780×1688 / 30fps, encoded from 359 actual captured frames. Screenshots, MP4, and GIF have been replaced for this revision. Browser viewport checks simulate keyboard geometry; they do not open a physical iPhone keyboard. Native device execution is unavailable on this Mac. Earlier checks of the old design are not verification of this revision.

## Hosting and next steps

Permanent Vercel project: murmur-voice-demo, owner mustafachaiwala2003-6618. The local folder is linked. vercel.json declares the Bun/Expo source build. The static export can be uploaded to the same project. Keep .vercel and .env.local ignored and never print their contents. The old anonymous preview expired. GitHub Pages remains optional/manual because the GitHub account previously reported an Actions billing lock.

See RECRUITER_WALKTHROUGH.md for a plain-language implementation explanation. Real speech recognition, AI networking, accounts, and multi-screen routing are outside this exercise; persistence is included at the user’s explicit request.
