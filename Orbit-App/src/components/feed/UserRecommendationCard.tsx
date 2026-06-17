import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

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

      <View style={styles.chips}>
        {user.commonInterests.map((interest) => (
          <OrbitChip key={interest} label={interest} selected />
        ))}
      </View>

      <RecommendationReasonList reasons={user.reasons} />

      {expanded ? (
        <View style={styles.bioBox}>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
      ) : null}

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
});
