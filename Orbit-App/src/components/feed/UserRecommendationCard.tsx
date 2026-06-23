import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { intentModeLabels } from "../../constants/options";
import { theme } from "../../styles/theme";
import type { IntentMode } from "../../types/profile";
import type { UserRecommendation } from "../../types/recommendation";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import OrbitCard from "../ui/OrbitCard";
import OrbitChip from "../ui/OrbitChip";
import CompatibilityBadge from "./CompatibilityBadge";
import RecommendationReasonList from "./RecommendationReasonList";
import SwipeActionButtons, { type FeedAction } from "./SwipeActionButtons";

type UserRecommendationCardProps = {
  user: UserRecommendation;
  viewerMode: IntentMode;
  expanded: boolean;
  onPass: () => void;
  onLike: () => void;
  onViewProfile: () => void;
  onOpenProfile: () => void;
  loadingAction?: FeedAction | null;
};

export default function UserRecommendationCard({
  user,
  viewerMode,
  expanded,
  onPass,
  onLike,
  onViewProfile,
  onOpenProfile,
  loadingAction = null,
}: UserRecommendationCardProps) {
  const showCompatibility = viewerMode !== "CASUAL";
  const explanationLabel = getExplanationLabel(viewerMode);
  const photoUrl = resolveMediaUrl(user.photoUrl);

  return (
    <OrbitCard elevated style={styles.card}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenProfile}
        style={({ pressed }) => [styles.photoPressable, pressed && styles.pressed]}
      >
        <View style={[styles.photo, { backgroundColor: user.photoColor }]}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoImage} />
          ) : (
            <Text style={styles.initial}>{user.name.charAt(0)}</Text>
          )}
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.10)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.72)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.photoMeta}>
            <Text style={styles.intentPill}>{intentModeLabels[user.intentMode]}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.identity}>
          <Pressable accessibilityRole="button" onPress={onOpenProfile}>
            <Text style={styles.name}>
              {user.name}{user.age !== null ? `, ${user.age}` : ""}
            </Text>
          </Pressable>
          {user.city ? <Text style={styles.meta}>{user.city}</Text> : null}
        </View>
        {showCompatibility ? <CompatibilityBadge value={user.mutualScore} /> : null}
      </View>

      {viewerMode === "SERIOUS" ? (
        <View style={styles.coverageRow}>
          <Ionicons name="analytics-outline" color={theme.colors.purpleLight} size={16} />
          <Text style={styles.coverageText}>
            {user.coveragePercentage}% de cobertura para este cálculo bilateral
          </Text>
        </View>
      ) : null}

      {user.bio ? (
        <Text numberOfLines={expanded ? undefined : 2} style={styles.bio}>
          {user.bio}
        </Text>
      ) : null}

      {user.commonInterests.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interesses em comum</Text>
          <View style={styles.chips}>
            {user.commonInterests.slice(0, expanded ? 6 : 4).map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </View>
      ) : null}

      {user.reasons.length > 0 ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={onViewProfile}
            style={({ pressed }) => [styles.explainButton, pressed && styles.pressed]}
          >
            <View style={styles.explainButtonCopy}>
              <Text style={styles.explainButtonText}>{explanationLabel}</Text>
              {showCompatibility ? (
                <Text style={styles.explainButtonMeta}>
                  {user.mutualScore}% de compatibilidade bilateral
                </Text>
              ) : null}
            </View>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              color={theme.colors.text}
              size={18}
            />
          </Pressable>

          {expanded ? (
            <View style={styles.explainBox}>
              <RecommendationReasonList reasons={user.reasons} />
              <Text style={styles.notice}>
                O resultado considera os dois lados da conexão. Temas sensíveis influenciam o cálculo sem expor respostas pessoais.
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      <SwipeActionButtons
        intentMode={viewerMode}
        onPass={onPass}
        onLike={onLike}
        loadingAction={loadingAction}
      />
    </OrbitCard>
  );
}

function getExplanationLabel(mode: IntentMode) {
  if (mode === "SERIOUS") {
    return "Por que entrou na sua curadoria?";
  }
  if (mode === "EXPLORING") {
    return "Afinidades desta recomendação";
  }
  return "O que vocês têm em comum";
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.lg },
  photoPressable: {
    borderRadius: theme.radius.xl,
  },
  photo: {
    height: 342,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  initial: { color: theme.colors.text, fontSize: 96, fontWeight: "500", opacity: 0.94 },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoMeta: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    alignItems: "flex-end",
  },
  intentPill: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
    borderRadius: theme.radius.round,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md },
  identity: { flex: 1 },
  name: { color: theme.colors.text, fontSize: theme.typography.heading, fontWeight: "500" },
  meta: { color: theme.colors.textMuted, fontSize: theme.typography.small, marginTop: 2 },
  coverageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.purpleSoft,
  },
  coverageText: { flex: 1, color: theme.colors.textMuted, fontSize: theme.typography.small },
  bio: { color: theme.colors.textMuted, fontSize: theme.typography.body, lineHeight: 22 },
  section: { gap: theme.spacing.sm },
  sectionTitle: { color: theme.colors.text, fontSize: theme.typography.small, fontWeight: "500" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  explainButton: {
    minHeight: 58,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.25)",
    backgroundColor: theme.colors.purpleSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  explainButtonCopy: { flex: 1, gap: 2 },
  explainButtonText: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: "500" },
  explainButtonMeta: { color: theme.colors.textMuted, fontSize: theme.typography.tiny, fontWeight: "500" },
  explainBox: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  notice: { color: theme.colors.textMuted, fontSize: theme.typography.small, lineHeight: 19 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
});
