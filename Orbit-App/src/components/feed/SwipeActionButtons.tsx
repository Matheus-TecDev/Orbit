import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import type { IntentMode } from "../../types/profile";

type SwipeActionButtonsProps = {
  intentMode: IntentMode;
  onPass: () => void;
  onLike: () => void;
  loadingAction?: FeedAction | null;
};

export default function SwipeActionButtons({
  intentMode,
  onPass,
  onLike,
  loadingAction = null,
}: SwipeActionButtonsProps) {
  const isBusy = loadingAction !== null;
  const labels = getActionLabels(intentMode);

  return (
    <View style={styles.wrap}>
      <ActionButton
        label={labels.pass}
        icon="close"
        tone="muted"
        onPress={onPass}
        loading={loadingAction === "pass"}
        disabled={isBusy}
      />
      <ActionButton
        label={labels.like}
        icon="heart"
        tone="primary"
        onPress={onLike}
        loading={loadingAction === "like"}
        disabled={isBusy}
      />
    </View>
  );
}

export type FeedAction = "pass" | "like";

function getActionLabels(intentMode: IntentMode) {
  if (intentMode === "SERIOUS") {
    return { pass: "Não é para mim", like: "Quero conhecer" };
  }
  if (intentMode === "EXPLORING") {
    return { pass: "Agora não", like: "Quero conhecer" };
  }
  return { pass: "Passar", like: "Curtir" };
}

type ActionButtonProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: "primary" | "muted";
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
  const iconColor = tone === "primary" ? theme.colors.rose : theme.colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        tone === "primary" ? styles.primary : styles.muted,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={icon} color={iconColor} size={20} />
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
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  primary: {
    backgroundColor: "rgba(232,91,122,0.12)",
    borderColor: "rgba(232,91,122,0.30)",
  },
  muted: {
    backgroundColor: "rgba(255,255,255,0.05)",
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
    fontWeight: "500",
  },
});
