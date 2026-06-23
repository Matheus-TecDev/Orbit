import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  OrbitCard,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { ChatListScreenProps } from "../../navigation/types";
import { getChats } from "../../services/chatService";
import { theme } from "../../styles/theme";
import type { ChatPreview } from "../../types/chat";
import { mapApiChatToChatPreview } from "../../types/chat";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function ChatListScreen({ navigation }: ChatListScreenProps) {
  const { token, user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
    let isActive = true;

    async function loadChats() {
      if (!token || !user) {
        setChats([]);
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

        setChats(apiChats.map((chat) => mapApiChatToChatPreview(chat, user.id)));
      } catch {
        if (!isActive) {
          return;
        }

        setChats([]);
        setChatError("Não foi possível carregar conversas. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadChats();

    return () => {
      isActive = false;
    };
    }, [token, user]),
  );

  return (
    <OrbitScreen>
      <OrbitHeader title="Conversas" subtitle="Mensagens recentes" />

      <View style={styles.stack}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : null}
        <OrbitErrorMessage message={chatError} />
        {!loading && chats.length === 0 ? (
          <OrbitEmptyState
            icon={chatError ? "cloud-offline-outline" : "chatbubbles-outline"}
            title="Nenhuma conversa ainda"
            description="Conversas aparecem depois que um match é criado e o chat fica disponível."
            actionLabel="Ver matches"
            onAction={() => navigation.navigate("Matches")}
          />
        ) : null}
        {!loading
          ? chats.map((chat) => (
              <ChatPreviewRow
                key={chat.id}
                chat={chat}
                onPress={() =>
                  navigation.navigate("Chat", {
                    chatId: chat.id,
                    participantName: chat.name,
                    participantUserId: chat.userId,
                    participantProfileId: chat.profileId,
                    matchId: chat.matchId,
                  })
                }
              />
            ))
          : null}
      </View>
    </OrbitScreen>
  );
}

type ChatPreviewRowProps = {
  chat: ChatPreview;
  onPress: () => void;
};

function ChatPreviewRow({ chat, onPress }: ChatPreviewRowProps) {
  const photoUrl = resolveMediaUrl(chat.photoUrl);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <OrbitCard style={styles.chatCard}>
        <View style={styles.avatar}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.initial}>{chat.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.name}>
              {chat.name}
            </Text>
            <Text style={styles.time}>{chat.time}</Text>
          </View>
          <Text numberOfLines={1} style={styles.message}>
            {chat.lastMessage}
          </Text>
        </View>
      </OrbitCard>
    </Pressable>
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
    backgroundColor: theme.colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initial: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
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
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  time: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
});
