import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { intentModeLabels } from "../../constants/options";
import { theme } from "../../styles/theme";
import type { IntentMode } from "../../types/profile";

type IntentCardProps = {
  intent: IntentMode;
  selected: boolean;
  onPress: () => void;
};

const intentDescriptions: Record<IntentMode, string> = {
  SERIOUS: "Quero construir uma relação com intenção e continuidade.",
  EXPLORING: "Estou aberto a conhecer pessoas e descobrir o que procuro.",
  CASUAL: "Quero algo leve ou sem compromisso neste momento.",
};

export default function IntentCard({ intent, selected, onPress }: IntentCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, selected && styles.iconSelected]}>
        <Ionicons
          name={selected ? "checkmark" : "heart-outline"}
          color={selected ? theme.colors.text : theme.colors.textSubtle}
          size={selected ? 17 : 18}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{intentModeLabels[intent]}</Text>
        <Text style={styles.description}>{intentDescriptions[intent]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  selected: {
    borderColor: "rgba(124,92,252,0.35)",
    backgroundColor: theme.colors.purpleSoft,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  iconSelected: {
    backgroundColor: theme.colors.purple,
    borderColor: "rgba(255,255,255,0.18)",
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
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
});
