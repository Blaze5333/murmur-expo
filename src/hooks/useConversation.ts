import { useCallback, useEffect, useRef, useState } from 'react';
import { loadHistory, saveHistory } from '../storage/chatStorage';
import { createMessage, type ChatMessage } from '../types/chat';

export type Stage = 'idle' | 'listening' | 'thinking';
export const VOICE_PROMPT = 'Help me make a plan for today.';
export const SUGGESTIONS = [
  'Make a plan for today',
  'Think something through',
  'Get a fresh perspective',
];

export function replyFor(text: string) {
  if (/plan|focus|work|busy/i.test(text)) {
    return 'Start with the one thing you most want to finish today. Break it into a step you can do in 20 minutes, and give that step your full attention. What would you start with?';
  }
  if (/perspective|inspir|stuck/i.test(text)) {
    return 'Try describing the situation as if it belonged to a friend. What would you notice, and what would you tell them? A little distance can make the next step easier to see.';
  }
  return 'Let’s work through it. What happened, what part is bothering you, and what would a useful next step look like? Start with whichever is easiest to put into words.';
}

export function useConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    loadHistory()
      .then((history) => {
        if (active) {
          setMessages(history);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setStorageError(true);
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    saveHistory(messages)
      .then(() => {
        if (active) setStorageError(false);
      })
      .catch(() => {
        if (active) setStorageError(true);
      });
    return () => {
      active = false;
    };
  }, [messages, ready]);

  const stopTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);
  useEffect(() => stopTimers, [stopTimers]);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const respond = useCallback(
    (text: string) => {
      stopTimers();
      busy.current = true;
      setTranscript('');
      setStage('thinking');
      setMessages((previous) => [...previous, createMessage('user', text)]);
      later(() => {
        setMessages((previous) => [
          ...previous,
          createMessage('assistant', replyFor(text)),
        ]);
        setStage('idle');
        busy.current = false;
      }, 1250);
    },
    [later, stopTimers],
  );

  const sendText = useCallback(
    (value: string) => {
      const text = value.trim();
      if (!ready || !text || busy.current) return false;
      respond(text);
      return true;
    },
    [ready, respond],
  );

  const startVoice = useCallback(() => {
    if (!ready || busy.current) return;
    busy.current = true;
    setStage('listening');
    setTranscript('');
    VOICE_PROMPT.split(' ').forEach((_, index, words) => {
      later(
        () => setTranscript(words.slice(0, index + 1).join(' ')),
        350 + index * 300,
      );
    });
    later(() => respond(VOICE_PROMPT), 3200);
  }, [ready, later, respond]);

  const finishVoice = useCallback(() => {
    if (stage === 'listening') respond(VOICE_PROMPT);
  }, [stage, respond]);

  const cancel = useCallback(() => {
    stopTimers();
    busy.current = false;
    setStage('idle');
    setTranscript('');
  }, [stopTimers]);

  const clearHistory = useCallback(() => {
    cancel();
    setMessages([]);
  }, [cancel]);

  return {
    messages,
    ready,
    storageError,
    stage,
    transcript,
    sendText,
    startVoice,
    finishVoice,
    cancel,
    clearHistory,
  };
}
