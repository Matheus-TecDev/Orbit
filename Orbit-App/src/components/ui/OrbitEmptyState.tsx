import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import OrbitButton from "./OrbitButton";
import OrbitCard from "./OrbitCard";

type IconName = ComponentProps<typeof Ionicons>["name"];

type OrbitEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
  children?: ReactNode;
};

export default function OrbitEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "planet-outline",
  children,
}: OrbitEmptyStateProps) {
  return (
    <OrbitCard style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} color={theme.colors.purple} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
      {actionLabel && onAction ? (
        <OrbitButton compact variant="secondary" label={actionLabel} onPress={onAction} />
      ) : null}
    </OrbitCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "flex-start",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
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
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
    lineHeight: 23,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
});
