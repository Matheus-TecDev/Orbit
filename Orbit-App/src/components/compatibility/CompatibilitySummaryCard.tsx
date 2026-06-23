import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import type {
  RecommendationReasonGroup,
  RecommendationScoreBreakdown,
} from "../../types/recommendation";
import OrbitCard from "../ui/OrbitCard";
import OrbitChip from "../ui/OrbitChip";

export type CompatibilitySummary = {
  mutualScore: number;
  coveragePercentage: number;
  scoreBreakdown: RecommendationScoreBreakdown | null;
  reasonGroups: RecommendationReasonGroup[];
  commonInterests: string[];
};

type CompatibilitySummaryCardProps = {
  compatibility: CompatibilitySummary | null;
  compact?: boolean;
};

type MetricItem = {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
};

const signalLabels: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  future: { label: "Projeto de vida", icon: "telescope-outline" },
  communication: { label: "Comunicação", icon: "chatbubbles-outline" },
  lifestyle: { label: "Estilo de vida", icon: "leaf-outline" },
  personality: { label: "Personalidade", icon: "sparkles-outline" },
  priorities: { label: "Prioridades", icon: "flag-outline" },
  preferences: { label: "Preferências", icon: "options-outline" },
  intent: { label: "Objetivo", icon: "heart-outline" },
};

export default function CompatibilitySummaryCard({
  compatibility,
  compact = false,
}: CompatibilitySummaryCardProps) {
  if (!compatibility) {
    return (
      <OrbitCard style={StyleSheet.flatten([styles.card, compact && styles.compactCard])}>
        <View style={styles.emptyIcon}>
          <Ionicons name="analytics-outline" color={theme.colors.textMuted} size={20} />
        </View>
        <View style={styles.emptyCopy}>
          <Text style={styles.title}>Compatibilidade</Text>
          <Text style={styles.muted}>
            Ainda não há compatibilidade disponível neste contexto.
          </Text>
        </View>
      </OrbitCard>
    );
  }

  const metricItems = buildMetricItems(compatibility.scoreBreakdown);
  const positiveReasons = flattenReasons(compatibility.reasonGroups);
  const signals = buildSignals(compatibility.reasonGroups);
  const conversationPoints = buildConversationPoints(compatibility);

  return (
    <OrbitCard style={StyleSheet.flatten([styles.card, compact && styles.compactCard])}>
      <View style={styles.header}>
        <View style={styles.scoreBadge}>
          <Text style={styles.score}>{compatibility.mutualScore}%</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Compatibilidade bilateral</Text>
          <Text style={styles.muted}>{getCoverageLabel(compatibility.coveragePercentage)}</Text>
        </View>
      </View>

      <View style={styles.coverageTrack}>
        <View
          style={[
            styles.coverageFill,
            { width: `${clampScore(compatibility.coveragePercentage)}%` },
          ]}
        />
      </View>
      <Text style={styles.coverageText}>
        {compatibility.coveragePercentage}% dos sinais disponíveis entraram no cálculo.
      </Text>

      {signals.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Sinais fortes</Text>
          <View style={styles.signalGrid}>
            {signals.slice(0, compact ? 3 : signals.length).map((signal) => (
              <View key={signal.label} style={styles.signalPill}>
                <Ionicons name={signal.icon} color={theme.colors.purpleLight} size={15} />
                <Text style={styles.signalText}>{signal.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {metricItems.length > 0 && !compact ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Base do cálculo</Text>
          <View style={styles.metrics}>
            {metricItems.map((item) => (
              <View key={item.label} style={styles.metricRow}>
                <View style={styles.metricLabelWrap}>
                  <Ionicons name={item.icon} color={theme.colors.textMuted} size={15} />
                  <Text style={styles.metricLabel}>{item.label}</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricFill, { width: `${item.value}%` }]} />
                </View>
                <Text style={styles.metricValue}>{item.value}%</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {positiveReasons.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Onde vocês combinam</Text>
          <View style={styles.reasonList}>
            {positiveReasons.slice(0, compact ? 3 : 6).map((reason) => (
              <View key={reason} style={styles.reasonItem}>
                <Ionicons name="checkmark-circle" color={theme.colors.teal} size={16} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {conversationPoints.length > 0 && !compact ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Pontos para conversar</Text>
          <View style={styles.reasonList}>
            {conversationPoints.map((point) => (
              <View key={point} style={styles.reasonItem}>
                <Ionicons name="chatbox-ellipses-outline" color={theme.colors.rose} size={16} />
                <Text style={styles.reasonText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {compatibility.commonInterests.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Interesses em comum</Text>
          <View style={styles.chips}>
            {compatibility.commonInterests.slice(0, compact ? 4 : 8).map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </View>
      ) : null}
    </OrbitCard>
  );
}

function buildMetricItems(
  breakdown: RecommendationScoreBreakdown | null,
): MetricItem[] {
  if (!breakdown) {
    return [];
  }

  const items = [
    {
      label: "Objetivo",
      value: breakdown.mode_alignment.score_a_to_b,
      icon: "heart-outline" as const,
    },
    {
      label: "Preferências",
      value: breakdown.objective_preferences.score_a_to_b,
      icon: "options-outline" as const,
    },
    {
      label: "Respostas",
      value: breakdown.compatibility_answers.score_a_to_b,
      icon: "analytics-outline" as const,
    },
    {
      label: "Prioridades",
      value: breakdown.priorities.score_a_to_b,
      icon: "flag-outline" as const,
    },
  ];

  return items.reduce<MetricItem[]>((nextItems, item) => {
    if (typeof item.value === "number") {
      nextItems.push({ ...item, value: clampScore(item.value) });
    }
    return nextItems;
  }, []);
}

function buildSignals(reasonGroups: RecommendationReasonGroup[]) {
  return reasonGroups
    .map((group) => signalLabels[group.category])
    .filter((signal): signal is { label: string; icon: keyof typeof Ionicons.glyphMap } =>
      Boolean(signal),
    );
}

function flattenReasons(reasonGroups: RecommendationReasonGroup[]) {
  return Array.from(
    new Set(reasonGroups.flatMap((group) => group.reasons).filter(Boolean)),
  );
}

function buildConversationPoints(compatibility: CompatibilitySummary) {
  const points: string[] = [];
  if (compatibility.coveragePercentage < 45) {
    points.push("Há poucas respostas em comum; vale conversar antes de tirar conclusões.");
  } else if (compatibility.coveragePercentage < 75) {
    points.push("A base é boa, mas ainda pode ficar mais precisa com perfil completo.");
  }
  if (compatibility.commonInterests.length === 0) {
    points.push("Ainda não apareceram interesses em comum no perfil.");
  }
  return points;
}

function getCoverageLabel(coverage: number) {
  if (coverage < 45) {
    return "Baseado em poucas respostas";
  }
  if (coverage < 75) {
    return "Boa base de compatibilidade";
  }
  return "Perfil bem preenchido";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  compactCard: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  scoreBadge: {
    width: 70,
    height: 70,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purple,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  score: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  coverageTrack: {
    height: 8,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  coverageFill: {
    height: "100%",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.teal,
  },
  coverageText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "400",
  },
  block: {
    gap: theme.spacing.sm,
  },
  blockTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  signalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  signalPill: {
    minHeight: 34,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.28)",
    backgroundColor: theme.colors.purpleSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  signalText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  metrics: {
    gap: theme.spacing.sm,
  },
  metricRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metricLabelWrap: {
    width: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "400",
  },
  metricBar: {
    flex: 1,
    height: 7,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.purpleLight,
  },
  metricValue: {
    width: 42,
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
    textAlign: "right",
  },
  reasonList: {
    gap: theme.spacing.sm,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  reasonText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCopy: {
    gap: theme.spacing.xs,
  },
});
