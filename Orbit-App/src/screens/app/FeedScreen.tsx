import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import UserRecommendationCard from "../../components/feed/UserRecommendationCard";
import type { FeedAction } from "../../components/feed/SwipeActionButtons";
import {
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { FeedScreenProps } from "../../navigation/types";
import { likeProfile, passProfile } from "../../services/matchService";
import { getFeedRecommendations } from "../../services/recommendationService";
import { theme } from "../../styles/theme";
import type { UserRecommendation } from "../../types/recommendation";

export default function FeedScreen(_props: FeedScreenProps) {
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<FeedAction | null>(null);
  const currentUser = recommendations[currentIndex];

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
  }, [token]);

  function goNext() {
    setFeedError(null);
    setExpandedId(null);
    setCurrentIndex((current) => current + 1);
  }

  async function handlePass() {
    await submitFeedAction("pass");
  }

  async function handleLike() {
    await submitFeedAction("like");
  }

  function handleSuperLike() {
    goNext();
  }

  async function submitFeedAction(action: Exclude<FeedAction, "superLike">) {
    if (loadingAction || !currentUser) {
      return;
    }

    if (!token || !currentUser.isApiBacked) {
      goNext();
      return;
    }

    setLoadingAction(action);
    setFeedError(null);

    try {
      if (action === "like") {
        await likeProfile(currentUser.profileId, token);
      } else {
        await passProfile(currentUser.profileId, token);
      }

      goNext();
    } catch {
      setFeedError(
        action === "like"
          ? "Não foi possível curtir este perfil. Tente novamente."
          : "Não foi possível passar este perfil. Tente novamente.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Feed" subtitle="Compatibilidade em primeiro plano" />
      <View style={styles.stack}>
        {loading ? <SkeletonCard image lines={4} /> : null}
        <OrbitErrorMessage message={feedError} />
        {!loading && currentUser ? (
          <UserRecommendationCard
            user={currentUser}
            expanded={expandedId === currentUser.id}
            onPass={handlePass}
            onLike={handleLike}
            onSuperLike={handleSuperLike}
            onViewProfile={() =>
              setExpandedId((current) => (current === currentUser.id ? null : currentUser.id))
            }
            loadingAction={loadingAction}
          />
        ) : null}
        {!loading && !currentUser ? (
          <OrbitEmptyState
            icon={feedError ? "cloud-offline-outline" : "heart-outline"}
            title={recommendations.length > 0 ? "Você viu todos os perfis" : "Sem recomendações agora"}
            description={
              recommendations.length > 0
                ? "Reinicie a lista para rever as recomendações carregadas."
                : "Quando houver perfis compatíveis com suas preferências, eles aparecerão aqui."
            }
            actionLabel={recommendations.length > 0 ? "Reiniciar feed" : undefined}
            onAction={recommendations.length > 0 ? () => setCurrentIndex(0) : undefined}
          />
        ) : null}
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
});
