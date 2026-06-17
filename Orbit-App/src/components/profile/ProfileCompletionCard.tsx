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
        <Text style={styles.title}>Perfil {percentage}% completo</Text>
        <Text style={styles.badge}>{percentage >= 100 ? "Completo" : "Em progresso"}</Text>
      </View>
      <OrbitProgressBar value={percentage} />
      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.slice(0, 3).map((suggestion) => (
            <Text key={suggestion} style={styles.suggestion}>
              {suggestion}
            </Text>
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
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  badge: {
    color: theme.colors.text,
    backgroundColor: theme.colors.orbitRedSoft,
    borderRadius: theme.radius.round,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
  suggestions: {
    gap: theme.spacing.xs,
  },
  suggestion: {
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
