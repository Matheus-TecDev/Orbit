import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  OrbitCard,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { ChatScreenProps } from "../../navigation/types";
import { getChatMessages, sendChatMessage } from "../../services/chatService";
import { theme } from "../../styles/theme";
import type { ChatMessage } from "../../types/chat";
import { mapApiMessageToChatMessage } from "../../types/chat";

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMessages() {
      if (!token || !user) {
        setMessages([]);
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

        setMessages(apiMessages.map((message) => mapApiMessageToChatMessage(message, user.id)));
      } catch {
        if (!isActive) {
          return;
        }

        setMessages([]);
        setChatError("Não foi possível carregar mensagens. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      isActive = false;
    };
  }, [route.params.chatId, token, user]);

  async function sendMessage() {
    const text = draft.trim();

    if (!text || sending) {
      return;
    }

    if (!token || !user) {
      setChatError("Entre novamente para enviar mensagens.");
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
      <OrbitHeader title="Conversa Orbit" subtitle="Mensagens" onBack={navigation.goBack} />

      <View style={styles.messages}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : null}
        <OrbitErrorMessage message={chatError} />
        {!loading && messages.length === 0 ? (
          <OrbitEmptyState
            icon={chatError ? "cloud-offline-outline" : "chatbubble-ellipses-outline"}
            title="Conversa sem mensagens"
            description="Quando vocês começarem a conversar, as mensagens aparecerão aqui."
          />
        ) : null}
        {!loading
          ? messages.map((message) => (
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
            ))
          : null}
      </View>

      <OrbitCard elevated style={styles.suggestion}>
        <View style={styles.suggestionIcon}>
          <Ionicons name="sparkles" color={theme.colors.orbitRed} size={16} />
        </View>
        <Text style={styles.suggestionText}>
          Use um interesse em comum ou uma pergunta leve para começar a conversa.
        </Text>
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
