import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { intentLabels } from "../../constants/options";
import { theme } from "../../styles/theme";
import type { IntentKey } from "../../types/profile";

type IntentCardProps = {
  intent: IntentKey;
  selected: boolean;
  onPress: () => void;
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
          name={selected ? "checkmark" : "ellipse"}
          color={selected ? theme.colors.text : theme.colors.textFaint}
          size={selected ? 17 : 8}
        />
      </View>
      <Text style={styles.title}>{intentLabels[intent]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 68,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  selected: {
    borderColor: "rgba(225,6,0,0.72)",
    backgroundColor: theme.colors.orbitRedSoft,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  iconSelected: {
    backgroundColor: theme.colors.orbitRedDark,
    borderColor: "rgba(255,255,255,0.18)",
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
});
