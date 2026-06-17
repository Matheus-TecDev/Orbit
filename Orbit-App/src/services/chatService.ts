import { apiRequest } from "./apiClient";
import type { ApiChat, ApiMessage, MessageCreate } from "../types/chat";

export async function getChats(token: string) {
  return apiRequest<ApiChat[]>("/chats", {
    method: "GET",
    token,
  });
}

export async function getChatMessages(chatId: string, token: string) {
  return apiRequest<ApiMessage[]>(`/chats/${chatId}/messages`, {
    method: "GET",
    token,
  });
}

export async function sendChatMessage(
  chatId: string,
  content: string,
  token: string,
) {
  const payload: MessageCreate = {
    content,
  };

  return apiRequest<ApiMessage>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: payload,
    token,
  });
}
