import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import NewMatchPrompt from "../../components/conversation/NewMatchPrompt";
import UserRecommendationCard from "../../components/feed/UserRecommendationCard";
import SwipeableRecommendationCard from "../../components/feed/SwipeableRecommendationCard";
import type { FeedAction } from "../../components/feed/SwipeActionButtons";
import {
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { getIntentMode } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { FeedScreenProps } from "../../navigation/types";
import { sendChatMessage } from "../../services/chatService";
import { likeProfile, passProfile } from "../../services/matchService";
import { getFeedRecommendations } from "../../services/recommendationService";
import { theme } from "../../styles/theme";
import type { ApiMatch } from "../../types/match";
import type { IntentMode } from "../../types/profile";
import type { UserRecommendation } from "../../types/recommendation";
import {
  buildConversationStarters,
  type ConversationStarter,
} from "../../utils/conversationStarters";

type NewMatchState = {
  matchId: string;
  chatId: string | null;
  participantName: string;
  participantUserId: string;
  participantProfileId: string;
  participantPhotoUrl: string | null;
  starters: ConversationStarter[];
};

export default function FeedScreen({ navigation }: FeedScreenProps) {
  const { token, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<FeedAction | null>(null);
  const [promptedMatchIds, setPromptedMatchIds] = useState<Set<string>>(new Set());
  const [newMatch, setNewMatch] = useState<NewMatchState | null>(null);
  const [sendingStarter, setSendingStarter] = useState(false);
  const currentUser = recommendations[currentIndex];
  const intentMode = getIntentMode(profile?.intent_mode ?? profile?.intention);
  const feedContent = getFeedContent(intentMode);

  useEffect(() => {
    let isActive = true;

    async function loadRecommendations() {
      if (!token) {
        setRecommendations([]);
        setFeedError("Entre novamente para atualizar suas recomendações.");
        return;
      }

      setLoading(true);
      setFeedError(null);

      try {
        const nextRecommendations = await getFeedRecommendations(token);
        if (!isActive) {
          return;
        }
        setRecommendations(nextRecommendations);
        setCurrentIndex(0);
        setExpandedId(null);
        setNewMatch(null);
      } catch {
        if (!isActive) {
          return;
        }
        setRecommendations([]);
        setCurrentIndex(0);
        setExpandedId(null);
        setFeedError("Não foi possível carregar recomendações. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadRecommendations();
    return () => {
      isActive = false;
    };
  }, [token, intentMode]);

  function goNext() {
    setFeedError(null);
    setExpandedId(null);
    setCurrentIndex((current) => current + 1);
  }

  async function submitFeedAction(action: FeedAction): Promise<boolean> {
    if (loadingAction || !currentUser) {
      return false;
    }
    if (!token) {
      setFeedError("Entre novamente para registrar esta ação.");
      return false;
    }

    setLoadingAction(action);
    setFeedError(null);
    try {
      if (action === "like") {
        const match = await likeProfile(currentUser.profileId, token);
        maybeShowNewMatch(match, currentUser);
      } else {
        await passProfile(currentUser.profileId, token);
      }
      goNext();
      return true;
    } catch {
      setFeedError(
        action === "like"
          ? "Não foi possível curtir este perfil. Tente novamente."
          : "Não foi possível passar este perfil. Tente novamente.",
      );
      return false;
    } finally {
      setLoadingAction(null);
    }
  }

  function maybeShowNewMatch(match: ApiMatch, recommendation: UserRecommendation) {
    if (match.status !== "matched" || promptedMatchIds.has(match.id)) {
      return;
    }
    const participant = match.other_participant;
    setPromptedMatchIds((current) => {
      const next = new Set(current);
      next.add(match.id);
      return next;
    });
    setNewMatch({
      matchId: match.id,
      chatId: match.chat_id,
      participantName: participant.name || recommendation.name,
      participantUserId: participant.user_id,
      participantProfileId: participant.profile_id ?? recommendation.profileId,
      participantPhotoUrl: participant.photo_url ?? recommendation.photoUrl,
      starters: buildConversationStarters({
        interests: participant.interests?.length ? participant.interests : recommendation.interests,
        commonInterests: recommendation.commonInterests,
        reasonGroups: recommendation.reasonGroups,
        intentMode: participant.intent_mode ?? recommendation.intentMode,
      }),
    });
  }

  function dismissNewMatch() {
    setNewMatch(null);
  }

  function openNewMatchChat() {
    if (!newMatch?.chatId) {
      navigation.navigate("Matches");
      setNewMatch(null);
      return;
    }
    navigation.navigate("Chat", {
      chatId: newMatch.chatId,
      participantName: newMatch.participantName,
      participantUserId: newMatch.participantUserId,
      participantProfileId: newMatch.participantProfileId,
      matchId: newMatch.matchId,
    });
    setNewMatch(null);
  }

  async function sendNewMatchStarter(text: string) {
    if (!token || !newMatch?.chatId || sendingStarter) {
      setFeedError("Abra a conversa para enviar a primeira mensagem.");
      return;
    }
    setSendingStarter(true);
    setFeedError(null);
    try {
      await sendChatMessage(newMatch.chatId, text, token);
      openNewMatchChat();
    } catch {
      setFeedError("Não foi possível enviar a mensagem. Tente pelo chat.");
    } finally {
      setSendingStarter(false);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title={feedContent.title} subtitle={feedContent.subtitle} />
      <View style={styles.stack}>
        {loading ? <SkeletonCard image lines={4} /> : null}
        <OrbitErrorMessage message={feedError} />
        {newMatch ? (
          <NewMatchPrompt
            name={newMatch.participantName}
            photoUrl={newMatch.participantPhotoUrl}
            starters={newMatch.starters}
            sending={sendingStarter}
            onDismiss={dismissNewMatch}
            onOpenChat={openNewMatchChat}
            onSendStarter={(text) => {
              void sendNewMatchStarter(text);
            }}
          />
        ) : null}
        {!loading && currentUser ? (
          <>
            <Text style={styles.progress}>
              {currentIndex + 1} de {recommendations.length} nesta seleção
            </Text>
            <SwipeableRecommendationCard
              key={currentUser.id}
              disabled={loadingAction !== null}
              onSwipe={submitFeedAction}
            >
              <UserRecommendationCard
                user={currentUser}
                viewerMode={intentMode}
                expanded={expandedId === currentUser.id}
                onPass={() => {
                  void submitFeedAction("pass");
                }}
                onLike={() => {
                  void submitFeedAction("like");
                }}
                onViewProfile={() =>
                  setExpandedId((current) => (current === currentUser.id ? null : currentUser.id))
                }
                onOpenProfile={() =>
                  navigation.navigate("PublicProfile", {
                    profileId: currentUser.profileId,
                    source: "feed",
                  })
                }
                loadingAction={loadingAction}
              />
            </SwipeableRecommendationCard>
          </>
        ) : null}
        {!loading && !currentUser ? (
          <OrbitEmptyState
            icon={feedError ? "cloud-offline-outline" : "heart-outline"}
            title={
              recommendations.length > 0
                ? feedContent.completedTitle
                : "Sem recomendações relevantes agora"
            }
            description={
              recommendations.length > 0
                ? feedContent.completedDescription
                : "Sua curadoria não força perfis aleatórios. Complete seu perfil e revise preferências para abrir novas possibilidades."
            }
          />
        ) : null}
      </View>
    </OrbitScreen>
  );
}

function getFeedContent(mode: IntentMode) {
  if (mode === "SERIOUS") {
    return {
      title: "Sua curadoria",
      subtitle: "Compatibilidade bilateral, futuro e comunicação",
      completedTitle: "Curadoria concluída",
      completedDescription: "Você avaliou todos os perfis relevantes disponíveis para este momento.",
    };
  }
  if (mode === "EXPLORING") {
    return {
      title: "Pessoas para conhecer",
      subtitle: "Interesses, afinidades e espaço para descobrir",
      completedTitle: "Seleção concluída",
      completedDescription: "Você conheceu as pessoas relevantes disponíveis nesta seleção.",
    };
  }
  return {
    title: "Explorar",
    subtitle: "Afinidade leve, interesses e contexto local",
    completedTitle: "Exploração concluída",
    completedDescription: "Você avaliou os perfis relevantes disponíveis agora.",
  };
}

const styles = StyleSheet.create({
  stack: { gap: theme.spacing.lg },
  progress: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
    textAlign: "right",
  },
});
