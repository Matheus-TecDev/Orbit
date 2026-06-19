import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

export type OrbitButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "google"
  | "instagram"
  | "danger";

type OrbitButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: OrbitButtonVariant;
  compact?: boolean;
};

const instagramGradient = ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"] as const;

export default function OrbitButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  variant = "primary",
  compact = false,
}: OrbitButtonProps) {
  const isDisabled = disabled || loading;
  const content = (
    <>
      {loading ? (
        <View style={styles.icon}>
          <ActivityIndicator
            size="small"
            color={variant === "google" ? "#202124" : theme.colors.white}
          />
        </View>
      ) : icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : null}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.text,
          variant === "google" && styles.googleText,
          (variant === "secondary" || variant === "ghost") && styles.secondaryText,
          variant === "danger" && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </>
  );

  if (variant === "primary" || variant === "instagram") {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          compact && styles.compactOuter,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={variant === "primary" ? theme.gradients.primary : instagramGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, compact && styles.compact]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "google" && styles.google,
        variant === "danger" && styles.danger,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  compactOuter: {
    borderRadius: theme.radius.sm,
  },
  base: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  compact: {
    minHeight: 44,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.borderEmphasis,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.borderEmphasis,
  },
  google: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  danger: {
    backgroundColor: "rgba(232,91,122,0.12)",
    borderWidth: 1,
    borderColor: "rgba(232,91,122,0.30)",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  icon: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.body,
    fontWeight: "500",
    textAlign: "center",
  },
  googleText: {
    color: "#202124",
  },
  secondaryText: {
    color: theme.colors.textSecondary,
  },
  dangerText: {
    color: theme.colors.rose,
  },
});
