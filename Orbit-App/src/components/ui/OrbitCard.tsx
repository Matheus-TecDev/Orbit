import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, type ViewStyle } from "react-native";

import { theme } from "../../styles/theme";

type OrbitCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
};

export default function OrbitCard({ children, style, elevated = false }: OrbitCardProps) {
  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.105)", "rgba(255,255,255,0.052)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, elevated && styles.elevated, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    overflow: "hidden",
    ...theme.shadows.soft,
  },
  elevated: {
    borderColor: theme.colors.borderStrong,
    ...theme.shadows.elevated,
  },
});
