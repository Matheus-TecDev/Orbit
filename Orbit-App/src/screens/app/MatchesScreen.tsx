import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { MatchesScreenProps } from "../../navigation/types";
import { getMatchList } from "../../services/matchService";
import { theme } from "../../styles/theme";
import type { MatchListItem } from "../../types/match";

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMatches() {
      if (!token) {
        setMatches([]);
        setMatchesError("Entre novamente para atualizar seus matches.");
        return;
      }

      setLoading(true);
      setMatchesError(null);

      try {
        const nextMatches = await getMatchList(token);

        if (!isActive) {
          return;
        }

        setMatches(nextMatches);
      } catch {
        if (!isActive) {
          return;
        }

        setMatches([]);
        setMatchesError("Não foi possível carregar seus matches. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadMatches();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Matches" subtitle="Pessoas que também curtiram você" />

      <View style={styles.stack}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : null}
        <OrbitErrorMessage message={matchesError} />
        <OrbitErrorMessage message={chatError} />
        {!loading && matches.length === 0 ? (
          <OrbitEmptyState
            icon={matchesError ? "cloud-offline-outline" : "heart-outline"}
            title="Sem matches ainda"
            description="Curta perfis no Feed. Quando houver interesse mútuo, o match aparecerá aqui."
            actionLabel="Ir para o Feed"
            onAction={() => navigation.navigate("Feed")}
          />
        ) : null}
        {!loading
          ? matches.map((match, index) => (
              <OrbitCard key={match.id} elevated={index === 0} style={styles.matchCard}>
                <View style={[styles.avatar, { backgroundColor: match.photoColor }]}>
                  <Text style={styles.initial}>{match.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{match.name}</Text>
                    {match.isNew ? <Text style={styles.badge}>Novo match</Text> : null}
                  </View>
                  <Text style={styles.meta}>{match.compatibility}% de compatibilidade</Text>
                </View>
                <OrbitButton
                  compact
                  variant="secondary"
                  label="Conversa"
                  onPress={() => {
                    if (match.chatId) {
                      setChatError(null);
                      navigation.navigate("Chat", { chatId: match.chatId });
                      return;
                    }

                    setChatError("Este match ainda não tem conversa disponível.");
                  }}
                  icon={<Ionicons name="chatbubble" color={theme.colors.text} size={16} />}
                />
              </OrbitCard>
            ))
          : null}
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  initial: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "500",
  },
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  badge: {
    color: theme.colors.text,
    backgroundColor: theme.colors.purple,
    borderRadius: theme.radius.round,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
});
