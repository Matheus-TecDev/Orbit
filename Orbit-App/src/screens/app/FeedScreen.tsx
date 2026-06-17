import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import UserRecommendationCard from "../../components/feed/UserRecommendationCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { mockUsers } from "../../data/mockUsers";
import { likeProfile, passProfile } from "../../services/matchService";
import { getFeedRecommendations } from "../../services/recommendationService";
import { theme } from "../../styles/theme";
import type { FeedScreenProps } from "../../navigation/types";
import type { UserRecommendation } from "../../types/recommendation";
import type { FeedAction } from "../../components/feed/SwipeActionButtons";

export default function FeedScreen(_props: FeedScreenProps) {
  const { token } = useAuth();
  const [recommendations, setRecommendations] =
    useState<UserRecommendation[]>(mockUsers);
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
        setRecommendations(mockUsers);
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

        if (nextRecommendations.length === 0) {
          setRecommendations(mockUsers);
          setFeedError("Ainda não há recomendações reais. Mostrando sugestões locais.");
        } else {
          setRecommendations(nextRecommendations);
        }

        setCurrentIndex(0);
        setExpandedId(null);
      } catch {
        if (!isActive) {
          return;
        }

        setRecommendations(mockUsers);
        setCurrentIndex(0);
        setExpandedId(null);
        setFeedError(
          "Não foi possível carregar recomendações reais. Mostrando sugestões locais.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

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

  if (!currentUser) {
    return (
      <OrbitScreen>
        <OrbitHeader title="Feed" subtitle="Recomendações de hoje" />
        <OrbitCard elevated style={styles.empty}>
          <Text style={styles.emptyTitle}>Você viu todos os perfis disponíveis.</Text>
          <Text style={styles.emptyText}>
            Reinicie a lista para rever as recomendações carregadas.
          </Text>
          <OrbitButton label="Reiniciar feed" onPress={() => setCurrentIndex(0)} />
        </OrbitCard>
      </OrbitScreen>
    );
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Feed" subtitle="Recomendações explicadas por compatibilidade" />
      <View style={styles.stack}>
        {loading ? (
          <OrbitCard style={styles.statusCard}>
            <Text style={styles.statusText}>Carregando recomendações reais...</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={feedError} />
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
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  empty: {
    gap: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
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
