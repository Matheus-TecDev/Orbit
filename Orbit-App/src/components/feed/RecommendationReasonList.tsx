import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type RecommendationReasonListProps = {
  reasons: string[];
};

export default function RecommendationReasonList({
  reasons,
}: RecommendationReasonListProps) {
  return (
    <View style={styles.wrap}>
      {reasons.map((reason) => (
        <View key={reason} style={styles.item}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={13} color={theme.colors.orbitRed} />
          </View>
          <Text style={styles.text}>{reason}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: "rgba(0,0,0,0.18)",
    padding: theme.spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.orbitRedSoft,
  },
  text: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
