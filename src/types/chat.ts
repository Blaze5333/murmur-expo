export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
};

let nextId = 0;

export function createMessage(
  role: ChatMessage['role'],
  text: string,
): ChatMessage {
  return {
    id: Date.now().toString(36) + '-' + nextId++,
    role,
    text,
    createdAt: Date.now(),
  };
}
