import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type CompatibilityBadgeProps = {
  value: number;
};

export default function CompatibilityBadge({ value }: CompatibilityBadgeProps) {
  return (
    <LinearGradient
      colors={["rgba(225,6,0,0.32)", "rgba(255,255,255,0.08)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Text style={styles.value}>{value}%</Text>
      <Text style={styles.label}>compatível</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 84,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.orbitRedSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.glow,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  label: {
    color: "rgba(255,255,255,0.74)",
    fontSize: theme.typography.tiny,
    fontWeight: "800",
  },
});
