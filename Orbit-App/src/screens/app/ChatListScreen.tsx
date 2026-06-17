import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { mockChats } from "../../data/mockChats";
import {
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { getChats } from "../../services/chatService";
import { theme } from "../../styles/theme";
import type { ChatListScreenProps } from "../../navigation/types";
import type { ChatPreview } from "../../types/chat";
import { mapApiChatToChatPreview } from "../../types/chat";

export default function ChatListScreen({ navigation }: ChatListScreenProps) {
  const { token, user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>(mockChats);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadChats() {
      if (!token || !user) {
        setChats(mockChats);
        setChatError("Entre novamente para atualizar suas conversas.");
        return;
      }

      setLoading(true);
      setChatError(null);

      try {
        const apiChats = await getChats(token);

        if (!isActive) {
          return;
        }

        if (apiChats.length === 0) {
          setChats(mockChats);
          setChatError("Ainda não há conversas reais. Mostrando conversas locais.");
        } else {
          setChats(apiChats.map((chat) => mapApiChatToChatPreview(chat, user.id)));
        }
      } catch {
        if (!isActive) {
          return;
        }

        setChats(mockChats);
        setChatError("Não foi possível carregar conversas reais. Mostrando conversas locais.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadChats();

    return () => {
      isActive = false;
    };
  }, [token, user]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Conversas" subtitle="Mensagens recentes" />

      <View style={styles.stack}>
        {loading ? (
          <OrbitCard style={styles.statusCard}>
            <Text style={styles.statusText}>Carregando conversas reais...</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={chatError} />
        {chats.map((chat) => (
          <Pressable
            key={chat.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate("Chat", { chatId: chat.id })}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <OrbitCard elevated={chat.unread} style={styles.chatCard}>
              <View style={styles.avatar}>
                <Text style={styles.initial}>{chat.name.charAt(0)}</Text>
                {chat.online ? <View style={styles.online} /> : null}
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{chat.name}</Text>
                  <Text style={styles.time}>{chat.time}</Text>
                </View>
                <Text numberOfLines={1} style={styles.message}>
                  {chat.lastMessage}
                </Text>
              </View>
              {chat.unread ? (
                <Ionicons name="ellipse" color={theme.colors.orbitRed} size={11} />
              ) : null}
            </OrbitCard>
          </Pressable>
        ))}
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.orbitRedSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  initial: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  online: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 13,
    height: 13,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  time: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
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
});
