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
            color={variant === "google" ? "#3C4043" : theme.colors.text}
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
        ]}
      >
        {label}
      </Text>
    </>
  );

  if (variant === "instagram") {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          compact && styles.compact,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={instagramGradient}
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
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "google" && styles.google,
        variant === "danger" && styles.danger,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  base: {
    minHeight: 54,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  primary: {
    backgroundColor: theme.colors.orbitRedDark,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...theme.shadows.glow,
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  google: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  danger: {
    backgroundColor: "rgba(255,86,86,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,86,86,0.34)",
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
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  googleText: {
    color: "#3C4043",
  },
  secondaryText: {
    color: theme.colors.text,
  },
});
