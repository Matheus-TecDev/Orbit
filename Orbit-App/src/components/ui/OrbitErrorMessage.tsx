import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type OrbitErrorMessageProps = {
  message: string | null;
};

export default function OrbitErrorMessage({ message }: OrbitErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Ionicons name="alert-circle" size={17} color={theme.colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,86,86,0.34)",
    backgroundColor: "rgba(255,86,86,0.10)",
    padding: theme.spacing.md,
  },
  text: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "800",
    lineHeight: 19,
  },
});
