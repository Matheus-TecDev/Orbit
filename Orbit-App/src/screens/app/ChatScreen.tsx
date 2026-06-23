import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import ConversationStarterCard from "../../components/conversation/ConversationStarterCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitConfirmDialog,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { ChatScreenProps } from "../../navigation/types";
import { getChatMessages, getChats, sendChatMessage } from "../../services/chatService";
import { unmatchMatch } from "../../services/matchService";
import { getPublicProfile } from "../../services/publicProfileService";
import { blockUser, reportUser } from "../../services/safetyService";
import { theme } from "../../styles/theme";
import type { ChatMessage } from "../../types/chat";
import { mapApiChatToChatPreview, mapApiMessageToChatMessage } from "../../types/chat";
import {
  buildConversationStarters,
  hasEnoughStarterContext,
  type ConversationStarter,
  type ConversationStarterInput,
} from "../../utils/conversationStarters";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState(route.params.participantName ?? "Conversa");
  const [participantPhotoUrl, setParticipantPhotoUrl] = useState<string | null>(null);
  const [participantUserId, setParticipantUserId] = useState(route.params.participantUserId ?? null);
  const [participantProfileId, setParticipantProfileId] = useState(route.params.participantProfileId ?? null);
  const [starters, setStarters] = useState<ConversationStarter[]>([]);
  const [matchId, setMatchId] = useState(route.params.matchId ?? null);
  const [pendingAction, setPendingAction] = useState<PendingChatSafetyAction | null>(null);

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
        const [apiMessages, apiChats] = await Promise.all([
          getChatMessages(route.params.chatId, token),
          getChats(token),
        ]);

        if (!isActive) {
          return;
        }

        const currentChat = apiChats
          .map((chat) => mapApiChatToChatPreview(chat, user.id))
          .find((chat) => chat.id === route.params.chatId);
        setParticipantName(route.params.participantName ?? currentChat?.name ?? "Conversa");
        setParticipantPhotoUrl(currentChat?.photoUrl ?? null);
        setParticipantUserId(route.params.participantUserId ?? currentChat?.userId ?? null);
        const nextProfileId = route.params.participantProfileId ?? currentChat?.profileId ?? null;
        setParticipantProfileId(nextProfileId);
        setMatchId(route.params.matchId ?? currentChat?.matchId ?? null);
        setMessages(apiMessages.map((message) => mapApiMessageToChatMessage(message, user.id)));
        const starterInput: ConversationStarterInput = {
          interests: currentChat?.interests ?? [],
          intentMode: currentChat?.intentMode ?? null,
        };
        if (!hasEnoughStarterContext(starterInput) && nextProfileId) {
          try {
            const publicProfile = await getPublicProfile(nextProfileId, token);
            if (!isActive) {
              return;
            }
            setStarters(buildConversationStarters({
              interests: publicProfile.interests,
              commonInterests: publicProfile.compatibility?.common_interests ?? [],
              reasonGroups: publicProfile.compatibility?.reason_groups ?? [],
              intentMode: publicProfile.intent_mode,
            }));
          } catch {
            if (!isActive) {
              return;
            }
            setStarters(buildConversationStarters(starterInput));
          }
        } else {
          setStarters(buildConversationStarters(starterInput));
        }
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
  }, [route.params.chatId, route.params.participantName, route.params.participantProfileId, token, user]);

  async function sendMessage() {
    const text = draft.trim();

    await sendMessageText(text);
  }

  async function sendMessageText(text: string) {
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
      <OrbitHeader title={participantName} subtitle="Mensagens" onBack={navigation.goBack} />

      <Pressable
        accessibilityRole="button"
        disabled={!participantProfileId}
        onPress={() => {
          if (participantProfileId) {
            navigation.navigate("PublicProfile", {
              profileId: participantProfileId,
              source: "chat",
              matchId,
              chatId: route.params.chatId,
            });
          }
        }}
        style={({ pressed }) => [
          styles.participantHeader,
          pressed && styles.participantHeaderPressed,
        ]}
      >
        <View style={styles.participantAvatar}>
          {resolveMediaUrl(participantPhotoUrl) ? (
            <Image
              source={{ uri: resolveMediaUrl(participantPhotoUrl) ?? "" }}
              style={styles.participantAvatarImage}
            />
          ) : (
            <Text style={styles.participantInitial}>{participantName.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.participantCopy}>
          <Text numberOfLines={1} style={styles.participantName}>{participantName}</Text>
          <Text style={styles.participantMeta}>Conversa do match</Text>
        </View>
        {participantProfileId ? (
          <Ionicons name="chevron-forward" color={theme.colors.textMuted} size={18} />
        ) : null}
      </Pressable>

      <View style={styles.messages}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : null}
        <OrbitErrorMessage message={chatError} />
        {feedback ? (
          <OrbitCard style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </OrbitCard>
        ) : null}
        {!loading && messages.length === 0 && starters.length > 0 ? (
          <ConversationStarterCard
            starters={starters}
            sending={sending}
            title="Quebre o gelo"
            description="Uma pergunta curta ajuda a conversa a começar."
            onSend={(text) => {
              void sendMessageText(text);
            }}
          />
        ) : null}
        {!loading && messages.length === 0 ? (
          <OrbitEmptyState
            icon={chatError ? "cloud-offline-outline" : "chatbubble-ellipses-outline"}
            title="A conversa ainda não começou"
            description="Use uma sugestão curta ou mande algo simples sobre o perfil."
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

      <View style={styles.safetyActions}>
        <OrbitButton
          compact
          variant="ghost"
          label="Desfazer"
          disabled={actionLoading || !matchId}
          onPress={() => setPendingAction("unmatch")}
        />
        <OrbitButton
          compact
          variant="ghost"
          label="Denunciar"
          disabled={actionLoading || !participantUserId}
          onPress={() => setPendingAction("report")}
        />
        <OrbitButton
          compact
          variant="danger"
          label="Bloquear"
          disabled={actionLoading || !participantUserId}
          onPress={() => setPendingAction("block")}
        />
      </View>
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Mensagem"
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.purple}
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
      <OrbitConfirmDialog
        visible={pendingAction !== null}
        title={getDialogTitle(pendingAction)}
        message={getDialogMessage(pendingAction, participantName)}
        confirmLabel={getDialogConfirmLabel(pendingAction)}
        loading={actionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={executePendingAction}
      />
    </OrbitScreen>
  );

  async function executePendingAction() {
    if (!token || !pendingAction) {
      setChatError("Entre novamente para continuar.");
      return;
    }

    setActionLoading(true);
    setChatError(null);
    setFeedback(null);

    try {
      if (pendingAction === "unmatch") {
        if (!matchId) {
          setChatError("Este chat não possui match ativo.");
          return;
        }
        await unmatchMatch(matchId, token);
        navigation.goBack();
      }
      if (pendingAction === "block") {
        if (!participantUserId) {
          setChatError("Não foi possível identificar o usuário.");
          return;
        }
        await blockUser(participantUserId, token);
        navigation.goBack();
      }
      if (pendingAction === "report") {
        if (!participantUserId) {
          setChatError("Não foi possível identificar o usuário.");
          return;
        }
        await reportUser(
          participantUserId,
          { reason: "denuncia_usuario", details: `Denúncia enviada a partir do chat ${route.params.chatId}.` },
          token,
        );
        setFeedback("Denúncia enviada.");
      }
      setPendingAction(null);
    } catch {
      setChatError("Não foi possível concluir esta ação.");
    } finally {
      setActionLoading(false);
    }
  }
}

type PendingChatSafetyAction = "unmatch" | "block" | "report";

function getDialogTitle(action: PendingChatSafetyAction | null) {
  if (action === "block") {
    return "Bloquear usuário?";
  }
  if (action === "report") {
    return "Denunciar usuário?";
  }
  return "Desfazer match?";
}

function getDialogMessage(action: PendingChatSafetyAction | null, name: string) {
  if (action === "block") {
    return `${name} não aparecerá mais em recomendações, matches ou conversas.`;
  }
  if (action === "report") {
    return `A denúncia sobre ${name} será registrada para revisão.`;
  }
  return `Você e ${name} deixarão de aparecer como match e o chat será encerrado.`;
}

function getDialogConfirmLabel(action: PendingChatSafetyAction | null) {
  if (action === "block") {
    return "Bloquear";
  }
  if (action === "report") {
    return "Denunciar";
  }
  return "Desfazer";
}

const styles = StyleSheet.create({
  participantHeader: {
    minHeight: 70,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  participantHeaderPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  participantAvatar: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  participantAvatarImage: {
    width: "100%",
    height: "100%",
  },
  participantInitial: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  participantCopy: {
    flex: 1,
    gap: 2,
  },
  participantName: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  participantMeta: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
  },
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
    backgroundColor: theme.colors.purple,
    borderTopRightRadius: theme.radius.sm,
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
    fontWeight: "500",
    alignSelf: "flex-end",
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  safetyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  feedbackCard: {
    borderColor: "rgba(76,217,100,0.28)",
    backgroundColor: "rgba(76,217,100,0.10)",
  },
  feedbackText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
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
    backgroundColor: theme.colors.purple,
  },
  sendPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  sendDisabled: {
    opacity: 0.52,
  },
});
