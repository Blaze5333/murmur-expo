import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type Stage = 'idle' | 'listening' | 'thinking' | 'responding' | 'replied';
export const VOICE_PROMPT = 'Help me slow down for a moment.';
export const SUGGESTIONS = ['Find my focus', 'Talk it out', 'A fresh perspective'];

export function replyFor(text: string) {
  if (/focus|work|busy/i.test(text)) {
    return 'Let’s make a little room. Pick one thing that matters today. What would a small, good first step look like?';
  }
  if (/perspective|inspir|stuck/i.test(text)) {
    return 'Try looking at it with a little curiosity. If a friend were in your shoes, what would you want them to hear?';
  }
  if (/slow|breath|moment|calm/i.test(text)) {
    return 'Of course. Relax your shoulders. Take one slow breath. You don’t have to figure everything out at once. I’m here.';
  }
  return 'I’m here. We can take it one thought at a time. What’s the one thing you’d like to make a little lighter today?';
}

function haptic(kind: 'tap' | 'success' = 'tap') {
  if (Platform.OS === 'web') return;
  const result = kind === 'success'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  void result.catch(() => { /* Haptics are optional on unsupported devices. */ });
}

/** One cancellable timeline owns every state transition and streamed word. */
export function useConversation() {
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [turn, setTurn] = useState(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const busy = useRef(false);

  const clearTimeline = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  useEffect(() => clearTimeline, [clearTimeline]);

  const reset = useCallback(() => {
    clearTimeline();
    busy.current = false;
    setStage('idle');
    setTranscript('');
    setPrompt('');
    setReply('');
    setTurn(value => value + 1);
  }, [clearTimeline]);

  const respond = useCallback((text: string) => {
    clearTimeline();
    busy.current = true;
    setPrompt(text);
    setTranscript('');
    setReply('');
    setStage('thinking');
    haptic();
    const words = replyFor(text).split(' ');
    later(() => {
      setStage('responding');
      haptic('success');
      words.forEach((_, index) => {
        later(() => setReply(words.slice(0, index + 1).join(' ')), index * 58);
      });
      later(() => {
        setStage('replied');
        busy.current = false;
      }, words.length * 58 + 250);
    }, 1850);
  }, [clearTimeline, later]);

  const startVoice = useCallback(() => {
    if (busy.current) return;
    clearTimeline();
    busy.current = true;
    setStage('listening');
    setPrompt('');
    setReply('');
    setTranscript('');
    setTurn(value => value + 1);
    haptic();
    const words = VOICE_PROMPT.split(' ');
    words.forEach((_, index) => {
      later(() => setTranscript(words.slice(0, index + 1).join(' ')), 650 + index * 370);
    });
    later(() => respond(VOICE_PROMPT), 4700);
  }, [clearTimeline, later, respond]);

  const finishVoice = useCallback(() => {
    if (stage === 'listening') respond(VOICE_PROMPT);
  }, [stage, respond]);

  const sendText = useCallback((value: string) => {
    const text = value.trim().slice(0, 280);
    if (!text || busy.current) return false;
    setTurn(value => value + 1);
    respond(text);
    return true;
  }, [respond]);

  return { stage, transcript, prompt, reply, turn, startVoice, finishVoice, sendText, reset };
}
