import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

import { theme } from "../../styles/theme";

type CompatibilityBadgeProps = {
  value: number;
};

export default function CompatibilityBadge({ value }: CompatibilityBadgeProps) {
  return (
    <LinearGradient
      colors={theme.gradients.match}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Text style={styles.value}>{value}%</Text>
      <Text style={styles.label}>match</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 82,
    borderRadius: 10,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  value: {
    color: theme.colors.white,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  label: {
    color: theme.colors.white,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});
