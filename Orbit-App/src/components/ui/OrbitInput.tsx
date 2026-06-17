import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { theme } from "../../styles/theme";

type OrbitInputProps = TextInputProps & {
  label: string;
};

export default function OrbitInput({ label, style, ...props }: OrbitInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textSubtle}
        selectionColor={theme.colors.orbitRed}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.055)",
    color: theme.colors.text,
    fontSize: theme.typography.body,
    paddingHorizontal: theme.spacing.lg,
  },
});
