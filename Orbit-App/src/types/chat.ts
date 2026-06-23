export type MessageAuthor = "me" | "match";

export type ChatMessage = {
  id: string;
  author: MessageAuthor;
  text: string;
  time: string;
};

export type ChatPreview = {
  id: string;
  matchId: string | null;
  userId: string;
  profileId: string | null;
  name: string;
  lastMessage: string;
  time: string;
  photoUrl: string | null;
  shortBio: string | null;
  intentMode: string | null;
  interests: string[];
  messages: ChatMessage[];
  isApiBacked?: boolean;
};

export type ParticipantSummary = {
  user_id: string;
  profile_id: string | null;
  name: string;
  age: number | null;
  city: string | null;
  short_bio: string | null;
  intent_mode: string | null;
  interests: string[];
  photo_url: string | null;
};

export type ApiChat = {
  id: string;
  match_id: string | null;
  participant_ids: string[];
  other_participant: ParticipantSummary | null;
  last_message: string | null;
  last_message_at: string | null;
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
  const participant = chat.other_participant;
  const otherParticipantId =
    participant?.user_id ??
    chat.participant_ids.find((participantId) => participantId !== currentUserId) ??
    chat.participant_ids[0] ??
    chat.id;

  return {
    id: chat.id,
    matchId: chat.match_id,
    userId: otherParticipantId,
    profileId: participant?.profile_id ?? null,
    name: participant?.name ?? "Conversa",
    lastMessage: chat.last_message ?? "Nenhuma mensagem ainda.",
    time: formatChatTime(chat.last_message_at ?? chat.updated_at),
    photoUrl: participant?.photo_url ?? null,
    shortBio: participant?.short_bio ?? null,
    intentMode: participant?.intent_mode ?? null,
    interests: participant?.interests ?? [],
    messages: [],
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
