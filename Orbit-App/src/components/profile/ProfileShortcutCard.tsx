import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps } from "react";

import { theme } from "../../styles/theme";
import OrbitCard from "../ui/OrbitCard";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ProfileShortcutCardProps = {
  title: string;
  summary: string;
  cta: "Editar" | "Ver";
  icon: IconName;
  onPress: () => void;
};

export default function ProfileShortcutCard({
  title,
  summary,
  cta,
  icon,
  onPress,
}: ProfileShortcutCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <OrbitCard style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} color={theme.colors.purpleLight} size={19} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <View style={styles.ctaWrap}>
          <Text style={styles.cta}>{cta}</Text>
          <Ionicons name="chevron-forward" color={theme.colors.textMuted} size={17} />
        </View>
      </OrbitCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.25)",
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  summary: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  ctaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  cta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
});
