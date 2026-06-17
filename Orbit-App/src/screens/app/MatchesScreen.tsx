import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { mockChats } from "../../data/mockChats";
import { mockUsers } from "../../data/mockUsers";
import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { getMatchList } from "../../services/matchService";
import { theme } from "../../styles/theme";
import type { MatchListItem } from "../../types/match";
import type { MatchesScreenProps } from "../../navigation/types";

const fallbackMatches: MatchListItem[] = mockUsers.slice(0, 3).map((user, index) => ({
  id: user.id,
  userId: user.id,
  name: user.name,
  age: user.age,
  city: user.city,
  status: "mock",
  chatId: null,
  compatibility: user.compatibility,
  photoColor: user.photoColor,
  isNew: index === 0,
}));

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchListItem[]>(fallbackMatches);
  const [loading, setLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMatches() {
      if (!token) {
        setMatches(fallbackMatches);
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

        if (nextMatches.length === 0) {
          setMatches(fallbackMatches);
          setMatchesError("Ainda não há matches reais. Mostrando conexões locais.");
        } else {
          setMatches(nextMatches);
        }
      } catch {
        if (!isActive) {
          return;
        }

        setMatches(fallbackMatches);
        setMatchesError("Não foi possível carregar matches reais. Mostrando conexões locais.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Matches" subtitle="Conexões recentes" />

      <View style={styles.stack}>
        {loading ? (
          <OrbitCard style={styles.statusCard}>
            <Text style={styles.statusText}>Carregando matches reais...</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={matchesError} />
        <OrbitErrorMessage message={chatError} />
        {matches.map((match, index) => {
          const chat = mockChats.find((item) => item.userId === match.userId) ?? mockChats[0];

          return (
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

                  if (match.status === "mock") {
                    setChatError(null);
                    navigation.navigate("Chat", { chatId: chat.id });
                    return;
                  }

                  setChatError("Este match ainda não tem conversa disponível.");
                }}
                icon={<Ionicons name="chatbubble" color={theme.colors.text} size={16} />}
              />
            </OrbitCard>
          );
        })}
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
    fontWeight: "900",
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
    fontWeight: "900",
  },
  badge: {
    color: theme.colors.text,
    backgroundColor: theme.colors.orbitRedDark,
    borderRadius: theme.radius.round,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "700",
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
