import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type SwipeActionButtonsProps = {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  loadingAction?: FeedAction | null;
};

export default function SwipeActionButtons({
  onPass,
  onLike,
  onSuperLike,
  loadingAction = null,
}: SwipeActionButtonsProps) {
  const isBusy = loadingAction !== null;

  return (
    <View style={styles.wrap}>
      <ActionButton
        label="Passar"
        icon="close"
        tone="muted"
        onPress={onPass}
        loading={loadingAction === "pass"}
        disabled={isBusy}
      />
      <ActionButton
        label="Curtir"
        icon="heart"
        tone="primary"
        onPress={onLike}
        loading={loadingAction === "like"}
        disabled={isBusy}
      />
      <ActionButton
        label="Super like"
        icon="star"
        tone="gold"
        onPress={onSuperLike}
        loading={loadingAction === "superLike"}
        disabled={isBusy}
      />
    </View>
  );
}

export type FeedAction = "pass" | "like" | "superLike";

type ActionTone = "primary" | "muted" | "gold";

type ActionButtonProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: ActionTone;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

function ActionButton({
  label,
  icon,
  tone,
  onPress,
  loading = false,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        tone === "primary" && styles.primary,
        tone === "muted" && styles.muted,
        tone === "gold" && styles.gold,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={tone === "gold" ? theme.colors.warning : theme.colors.text}
        />
      ) : (
        <Ionicons
          name={icon}
          color={tone === "gold" ? theme.colors.warning : theme.colors.text}
          size={20}
        />
      )}
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  action: {
    flex: 1,
    minHeight: 62,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  primary: {
    backgroundColor: theme.colors.orbitRedDark,
    borderColor: "rgba(255,255,255,0.16)",
  },
  muted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  gold: {
    backgroundColor: "rgba(242,184,75,0.10)",
    borderColor: "rgba(242,184,75,0.30)",
  },
  disabled: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
});
