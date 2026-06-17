import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { mockChats } from "../../data/mockChats";
import {
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { getChatMessages, sendChatMessage } from "../../services/chatService";
import { theme } from "../../styles/theme";
import type { ChatScreenProps } from "../../navigation/types";
import type { ChatMessage } from "../../types/chat";
import { mapApiMessageToChatMessage } from "../../types/chat";

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { token, user } = useAuth();
  const localChat = useMemo(
    () => mockChats.find((item) => item.id === route.params.chatId),
    [route.params.chatId],
  );
  const fallbackChat = useMemo(
    () => ({
      ...mockChats[0],
      ...localChat,
      id: route.params.chatId,
      name: localChat?.name ?? "Conversa Orbit",
      aiSuggestion:
        localChat?.aiSuggestion ?? "Use algo específico do match para começar a conversa.",
    }),
    [localChat, route.params.chatId],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(fallbackChat.messages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMessages() {
      if (!token || !user) {
        setMessages(fallbackChat.messages);
        setChatError("Entre novamente para atualizar esta conversa.");
        return;
      }

      setLoading(true);
      setChatError(null);

      try {
        const apiMessages = await getChatMessages(route.params.chatId, token);

        if (!isActive) {
          return;
        }

        if (apiMessages.length === 0) {
          setMessages(fallbackChat.messages);
          setChatError("Ainda não há mensagens reais. Mostrando conversa local.");
        } else {
          setMessages(
            apiMessages.map((message) => mapApiMessageToChatMessage(message, user.id)),
          );
        }
      } catch {
        if (!isActive) {
          return;
        }

        setMessages(fallbackChat.messages);
        setChatError("Não foi possível carregar mensagens reais. Mostrando conversa local.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isActive = false;
    };
  }, [fallbackChat.messages, route.params.chatId, token, user]);

  async function sendMessage() {
    const text = draft.trim();

    if (!text || sending) {
      return;
    }

    if (!token || !user) {
      setMessages((current) => [
        ...current,
        {
          id: `local-${current.length + 1}`,
          author: "me",
          text,
          time: "Agora",
        },
      ]);
      setDraft("");
      setChatError("Mensagem salva apenas localmente. Entre novamente para enviar pela API.");
      return;
    }

    setSending(true);
    setChatError(null);

    try {
      const apiMessage = await sendChatMessage(route.params.chatId, text, token);
      setMessages((current) => [
        ...current,
        mapApiMessageToChatMessage(apiMessage, user.id),
      ]);
      setDraft("");
    } catch {
      setChatError("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <OrbitScreen scroll={false}>
      <OrbitHeader title={fallbackChat.name} subtitle="Conversa" onBack={navigation.goBack} />

      <View style={styles.messages}>
        {loading ? (
          <OrbitCard style={styles.statusCard}>
            <Text style={styles.statusText}>Carregando mensagens reais...</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={chatError} />
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.author === "me" ? styles.myBubble : styles.matchBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
      </View>

      <OrbitCard elevated style={styles.suggestion}>
        <View style={styles.suggestionIcon}>
          <Ionicons name="sparkles" color={theme.colors.orbitRed} size={16} />
        </View>
        <Text style={styles.suggestionText}>{fallbackChat.aiSuggestion}</Text>
      </OrbitCard>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Mensagem"
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.orbitRed}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          onPress={sendMessage}
          disabled={sending}
          style={({ pressed }) => [
            styles.send,
            sending && styles.sendDisabled,
            pressed && styles.sendPressed,
          ]}
        >
          {sending ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <Ionicons name="send" color={theme.colors.text} size={18} />
          )}
        </Pressable>
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  messages: {
    flex: 1,
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  statusCard: {
    padding: theme.spacing.md,
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
    lineHeight: 19,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.orbitRedDark,
    borderTopRightRadius: theme.radius.sm,
    ...theme.shadows.glow,
  },
  matchBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.cardStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.sm,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  messageTime: {
    color: "rgba(255,255,255,0.52)",
    fontSize: theme.typography.tiny,
    fontWeight: "700",
    alignSelf: "flex-end",
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.orbitRedSoft,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 50,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.body,
  },
  send: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.orbitRedDark,
    ...theme.shadows.glow,
  },
  sendPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  sendDisabled: {
    opacity: 0.52,
  },
});
