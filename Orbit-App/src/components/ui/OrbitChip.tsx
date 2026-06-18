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
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: theme.colors.accentPinkSoft,
    borderColor: "rgba(255,77,136,0.48)",
  },
  pressed: {
    opacity: 0.78,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  selectedText: {
    color: theme.colors.text,
  },
});
