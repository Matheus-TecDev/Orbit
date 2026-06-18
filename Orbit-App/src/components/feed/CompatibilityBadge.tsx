import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type CompatibilityBadgeProps = {
  value: number;
};

export default function CompatibilityBadge({ value }: CompatibilityBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.value}>{value}%</Text>
      <Text style={styles.label}>match</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 82,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accentPinkSoft,
    borderWidth: 1,
    borderColor: "rgba(255,77,136,0.28)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
