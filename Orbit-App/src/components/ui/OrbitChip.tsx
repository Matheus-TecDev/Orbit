import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../../styles/theme";

type OrbitChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function OrbitChip({ label, selected = false, onPress }: OrbitChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text numberOfLines={1} style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: theme.colors.purpleSoft,
    borderColor: "rgba(124,92,252,0.35)",
  },
  pressed: {
    opacity: 0.78,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "400",
  },
  selectedText: {
    color: theme.colors.purpleLight,
  },
});
