import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import OrbitCard from "../ui/OrbitCard";
import OrbitProgressBar from "../ui/OrbitProgressBar";

type ProfileCompletionCardProps = {
  percentage: number;
  suggestions: string[];
};

export default function ProfileCompletionCard({
  percentage,
  suggestions,
}: ProfileCompletionCardProps) {
  return (
    <OrbitCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" color={theme.colors.accentPink} size={18} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Perfil {percentage}% completo</Text>
          <Text style={styles.subtitle}>
            Complete aos poucos para melhorar recomendações e matches.
          </Text>
        </View>
        <Text style={styles.badge}>{percentage >= 100 ? "Completo" : "Em progresso"}</Text>
      </View>
      <OrbitProgressBar value={percentage} />
      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.slice(0, 4).map((suggestion) => (
            <View key={suggestion} style={styles.suggestionRow}>
              <View style={styles.dot} />
              <Text style={styles.suggestion}>{suggestion}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.completeText}>Seu perfil já tem os principais sinais do MVP.</Text>
      )}
    </OrbitCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accentPinkSoft,
    borderWidth: 1,
    borderColor: "rgba(255,77,136,0.26)",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  badge: {
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.round,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
  suggestions: {
    gap: theme.spacing.sm,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.accentPink,
    marginTop: 6,
  },
  suggestion: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  completeText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
