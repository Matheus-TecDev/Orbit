import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { theme } from "../../styles/theme";

type OrbitCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
};

export default function OrbitCard({ children, style, elevated = false }: OrbitCardProps) {
  return <View style={[styles.card, elevated && styles.elevated, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: theme.colors.cardStrong,
    borderColor: theme.colors.borderStrong,
    ...theme.shadows.elevated,
  },
});
