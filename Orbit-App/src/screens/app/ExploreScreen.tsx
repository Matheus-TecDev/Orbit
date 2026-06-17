import { useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { intentLabels } from "../../constants/options";
import { mockUsers } from "../../data/mockUsers";
import { OrbitCard, OrbitChip, OrbitHeader, OrbitScreen } from "../../components/ui";
import { theme } from "../../styles/theme";
import type { ExploreScreenProps } from "../../navigation/types";
import type { UserRecommendation } from "../../types/recommendation";
import type { IntentKey } from "../../types/profile";

type ExploreFilter = "todos" | IntentKey;

const filterLabels: Record<ExploreFilter, string> = {
  todos: "Todos",
  serious: "Relacionamento",
  casual: "Casual",
  exploring: "Descobrindo",
};

const filters: ExploreFilter[] = ["todos", "serious", "casual", "exploring"];

export default function ExploreScreen(_props: ExploreScreenProps) {
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>("todos");

  const visibleUsers = useMemo(() => {
    return mockUsers.filter((user) => matchesFilter(user, activeFilter));
  }, [activeFilter]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Explorar" subtitle="Filtros visuais com usuários mockados" />

      <View style={styles.filters}>
        {filters.map((filter) => (
          <OrbitChip
            key={filter}
            label={filterLabels[filter]}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {visibleUsers.map((user) => (
          <OrbitCard key={user.id} elevated style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: user.photoColor }]}>
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(255,255,255,0.14)", "rgba(0,0,0,0.34)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.initial}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.userCopy}>
              <Text numberOfLines={1} style={styles.name}>
                {user.name}, {user.age}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {user.city}
              </Text>
              <Text numberOfLines={1} style={styles.intent}>
                {intentLabels[user.intent]}
              </Text>
              <Text style={styles.compatibility}>{user.compatibility}% compatível</Text>
            </View>
          </OrbitCard>
        ))}
      </View>
    </OrbitScreen>
  );
}

function matchesFilter(user: UserRecommendation, filter: ExploreFilter) {
  if (filter === "todos") {
    return true;
  }

  return user.intent === filter;
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  userCard: {
    width: "48%",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  avatar: {
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  initial: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: "900",
  },
  userCopy: {
    gap: 3,
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  intent: {
    color: theme.colors.orbitRed,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
  compatibility: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
  },
});
