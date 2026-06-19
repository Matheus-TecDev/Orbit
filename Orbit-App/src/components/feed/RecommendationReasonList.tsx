import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type RecommendationReasonListProps = {
  reasons: string[];
};

type ReasonTone = {
  backgroundColor: string;
  iconColor: string;
};

export default function RecommendationReasonList({
  reasons,
}: RecommendationReasonListProps) {
  return (
    <View style={styles.wrap}>
      {reasons.map((reason) => {
        const tone = getReasonTone(reason);

        return (
          <View key={reason} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: tone.backgroundColor }]}>
              <Ionicons name="sparkles" size={13} color={tone.iconColor} />
            </View>
            <Text style={styles.text}>{reason}</Text>
          </View>
        );
      })}
    </View>
  );
}

function getReasonTone(reason: string): ReasonTone {
  const normalized = reason.toLowerCase();

  if (normalized.includes("estilo") || normalized.includes("rotina")) {
    return {
      backgroundColor: "rgba(45,212,191,0.15)",
      iconColor: theme.colors.teal,
    };
  }

  if (normalized.includes("objetivo") || normalized.includes("intenção")) {
    return {
      backgroundColor: "rgba(91,127,255,0.15)",
      iconColor: "#8BA5FF",
    };
  }

  if (normalized.includes("interesse")) {
    return {
      backgroundColor: "rgba(232,91,122,0.15)",
      iconColor: theme.colors.rose,
    };
  }

  return {
    backgroundColor: "rgba(124,92,252,0.15)",
    iconColor: theme.colors.purpleLight,
  };
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  item: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: theme.colors.surface2,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 19,
    fontWeight: "400",
  },
});
