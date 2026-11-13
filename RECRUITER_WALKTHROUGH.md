# Explaining Murmur

Use this to understand the implementation and describe it in your own words. Be clear about tools or assistance used if asked.

## Short introduction

“Murmur is a small Expo chat screen. I focused on details that make conversation feel stable: messages enter gently, new replies scroll into view, the composer stays above the keyboard, and refreshing keeps the conversation.”

## Walk through the code

1. Message model (src/types/chat.ts): a stable ID, role, text, and timestamp. The message array is the source of truth. Sending appends messages instead of replacing the last turn.
2. Behavior (src/hooks/useConversation.ts): load history first. A synchronous busy ref prevents rapid duplicate sends. One hook owns timers and clears them on cancellation, clear, and unmount, preventing delayed ghost replies.
3. Storage (src/storage/chatStorage.ts): validate a small versioned JSON snapshot. Serialize writes so a slow older save cannot overwrite a newer one. AsyncStorage uses browser localStorage on web. Storage errors keep in-memory chat working and display a status.
4. Keyboard (Viewport.web.tsx and Composer.tsx): Safari has a layout viewport and a smaller visual viewport above the keyboard. The app follows the visible height/offset. The composer is a normal layout element, not an overlay. A 16px input avoids focus zoom; the wrapper owns its blue focus border.
5. Scrolling (ConversationScreen.tsx): scroll after measurement, follow when near the bottom, and always after sending. Preserve the reader’s place when they scroll up and provide a Latest messages shortcut.
6. Animation (MessageBubble.tsx): a short opacity/translation entrance shows what changed without animating the whole screen or changing row layout. Restored history stays still. Reduced motion removes translation.

## Tradeoffs to explain

- Replies and voice transcription are scripted so anyone can review the interaction without permissions, keys, or network timing.
- History stays on this device; it is not synchronized or sent to a backend.
- A ScrollView makes this small exercise easy to follow. For a large production history, use a paginated virtualized list.
- Browser tests include WebKit and simulated keyboard geometry. A physical iPhone keyboard still needs device testing.
- Clear is explicit and confirmed because it deletes saved history.

## Demo sequence

Send two messages, refresh, and show that both exchanges remain. Focus the composer on mobile. Scroll through a longer history and use Latest messages. Try and cancel the simulated voice preview. Explain the storage and timer ownership while walking through the small modules above.
