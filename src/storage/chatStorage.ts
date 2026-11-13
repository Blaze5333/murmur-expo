import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ChatMessage } from '../types/chat';

export const HISTORY_KEY = 'murmur.chat.v2';

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === 'string' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.text === 'string' &&
    typeof message.createdAt === 'number' &&
    Number.isFinite(message.createdAt)
  );
}

export async function loadHistory(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  const saved: unknown = JSON.parse(raw);
  if (!saved || typeof saved !== 'object') throw new Error('Invalid history');
  const snapshot = saved as { version?: number; messages?: unknown };
  if (
    snapshot.version !== 1 ||
    !Array.isArray(snapshot.messages) ||
    !snapshot.messages.every(isMessage)
  ) {
    throw new Error('Invalid history');
  }
  return snapshot.messages;
}

// Serialize writes so a slow older write cannot overwrite a newer conversation.
let pendingWrite: Promise<void> = Promise.resolve();

export function saveHistory(messages: ChatMessage[]) {
  pendingWrite = pendingWrite
    .catch(() => undefined)
    .then(() =>
      AsyncStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ version: 1, messages }),
      ),
    );
  return pendingWrite;
}
