export type MessageAuthor = "me" | "match";

export type ChatMessage = {
  id: string;
  author: MessageAuthor;
  text: string;
  time: string;
};

export type ChatPreview = {
  id: string;
  userId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
  messages: ChatMessage[];
  aiSuggestion: string;
  isApiBacked?: boolean;
};

export type ApiChat = {
  id: string;
  match_id: string | null;
  participant_ids: string[];
  last_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type MessageCreate = {
  content: string;
};

export function mapApiChatToChatPreview(chat: ApiChat, currentUserId: string): ChatPreview {
  const otherParticipantId =
    chat.participant_ids.find((participantId) => participantId !== currentUserId) ??
    chat.participant_ids[0] ??
    chat.id;

  return {
    id: chat.id,
    userId: otherParticipantId,
    name: "Conversa Orbit",
    lastMessage: chat.last_message ?? "Comece a conversa pelo Orbit.",
    time: formatChatTime(chat.updated_at),
    unread: Boolean(chat.last_message),
    online: true,
    messages: [],
    aiSuggestion: "Use algo específico do match para começar a conversa.",
    isApiBacked: true,
  };
}

export function mapApiMessageToChatMessage(
  message: ApiMessage,
  currentUserId: string,
): ChatMessage {
  return {
    id: message.id,
    author: message.sender_id === currentUserId ? "me" : "match",
    text: message.content,
    time: formatChatTime(message.created_at),
  };
}

function formatChatTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Agora";
  }

  const today = new Date();
  const isToday = parsed.toDateString() === today.toDateString();

  if (isToday) {
    return parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
