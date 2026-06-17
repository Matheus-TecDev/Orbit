import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { intentLabels } from "../../constants/options";
import { theme } from "../../styles/theme";
import type { UserRecommendation } from "../../types/recommendation";
import OrbitCard from "../ui/OrbitCard";
import OrbitChip from "../ui/OrbitChip";
import CompatibilityBadge from "./CompatibilityBadge";
import RecommendationReasonList from "./RecommendationReasonList";
import SwipeActionButtons, { type FeedAction } from "./SwipeActionButtons";

type UserRecommendationCardProps = {
  user: UserRecommendation;
  expanded: boolean;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onViewProfile: () => void;
  loadingAction?: FeedAction | null;
};

export default function UserRecommendationCard({
  user,
  expanded,
  onPass,
  onLike,
  onSuperLike,
  onViewProfile,
  loadingAction = null,
}: UserRecommendationCardProps) {
  return (
    <OrbitCard elevated style={styles.card}>
      <View style={[styles.photo, { backgroundColor: user.photoColor }]}>
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.14)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.58)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.initial}>{user.name.charAt(0)}</Text>
        <View style={styles.photoMeta}>
          <View style={styles.distanceBadge}>
            <Ionicons name="location" color={theme.colors.text} size={13} />
            <Text style={styles.distanceText}>{user.distanceKm} km</Text>
          </View>
          <Text style={styles.intentPill}>{intentLabels[user.intent]}</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>
          <Text style={styles.meta}>{user.city}</Text>
        </View>
        <CompatibilityBadge value={user.compatibility} />
      </View>

      {user.commonInterests.length > 0 ? (
        <View style={styles.chips}>
          {user.commonInterests.map((interest) => (
            <OrbitChip key={interest} label={interest} selected />
          ))}
        </View>
      ) : null}

      {expanded ? (
        <View style={styles.details}>
          <View style={styles.bioBox}>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
          <View style={styles.explainBox}>
            <View style={styles.explainHeader}>
              <View>
                <Text style={styles.explainEyebrow}>Por que essa pessoa?</Text>
                <Text style={styles.explainScore}>{user.compatibility}% de compatibilidade</Text>
              </View>
              <Ionicons name="sparkles" color={theme.colors.orbitRed} size={20} />
            </View>
            <RecommendationReasonList reasons={user.reasons} />
            {user.commonInterests.length > 0 ? (
              <View style={styles.commonBlock}>
                <Text style={styles.commonTitle}>Interesses em comum</Text>
                <View style={styles.chips}>
                  {user.commonInterests.map((interest) => (
                    <OrbitChip key={`detail-${interest}`} label={interest} selected />
                  ))}
                </View>
              </View>
            ) : null}
            <Text style={styles.notice}>
              O Orbit combina intenção, preferências, respostas de compatibilidade e sinais de
              atividade. Temas sensíveis entram no score sem aparecer como motivos explícitos.
            </Text>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={onViewProfile}
        style={({ pressed }) => [styles.explainButton, pressed && styles.pressed]}
      >
        <Ionicons
          name={expanded ? "chevron-up" : "help-circle"}
          color={theme.colors.text}
          size={17}
        />
        <Text style={styles.explainButtonText}>
          {expanded ? "Ocultar explicação" : "Por que essa pessoa?"}
        </Text>
      </Pressable>

      <SwipeActionButtons
        onPass={onPass}
        onLike={onLike}
        onSuperLike={onSuperLike}
        onViewProfile={onViewProfile}
        loadingAction={loadingAction}
      />
    </OrbitCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
  },
  photo: {
    height: 326,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  initial: {
    color: theme.colors.text,
    fontSize: 94,
    fontWeight: "900",
    opacity: 0.94,
  },
  photoMeta: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(0,0,0,0.36)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  distanceText: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
  intentPill: {
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
    borderRadius: theme.radius.round,
    overflow: "hidden",
    backgroundColor: "rgba(225,6,0,0.58)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  identity: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "900",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    marginTop: 2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  details: {
    gap: theme.spacing.md,
  },
  bioBox: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: theme.spacing.md,
  },
  bio: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  explainBox: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(225,6,0,0.28)",
    backgroundColor: theme.colors.orbitRedSoft,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  explainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  explainEyebrow: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  explainScore: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
    marginTop: 2,
  },
  commonBlock: {
    gap: theme.spacing.sm,
  },
  commonTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  notice: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  explainButton: {
    minHeight: 46,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.055)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  explainButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
