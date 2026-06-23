import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { ProfileCompatibilityScreenProps } from "../../navigation/types";
import { getMyCompatibilityProfile } from "../../services/compatibilityService";
import { theme } from "../../styles/theme";
import {
  dealbreakerOptions,
  getDimensionLabel,
  priorityDimensionOptions,
  type CompatibilityProfileRead,
} from "../../types/compatibility";

export default function ProfileCompatibilityScreen({
  navigation,
}: ProfileCompatibilityScreenProps) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<CompatibilityProfileRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCompatibility();
  }, [token]);

  async function loadCompatibility() {
    if (!token) {
      setError("Entre novamente para carregar compatibilidade.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextProfile = await getMyCompatibilityProfile(token);
      setProfile(nextProfile);
    } catch {
      setError("Não foi possível carregar compatibilidade.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  const priorityKeys = profile?.priorities.map((priority) => priority.dimension) ?? [];
  const dealbreakerKeys = profile?.dealbreakers.map((dealbreaker) => dealbreaker.rule_key) ?? [];
  const answersByDimension = buildAnswersByDimension(profile);

  return (
    <OrbitScreen>
      <OrbitHeader title="Compatibilidade" subtitle="Respostas, prioridades e limites" onBack={navigation.goBack} />

      <View style={styles.stack}>
        {loading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </>
        ) : null}
        <OrbitErrorMessage message={error} />

        {!loading && !profile ? (
          <OrbitEmptyState
            title="Compatibilidade não carregada"
            description="Tente novamente para ver seus dados reais de compatibilidade."
            actionLabel="Tentar novamente"
            onAction={loadCompatibility}
            icon="analytics-outline"
          />
        ) : null}

        {!loading && profile ? (
          <>
            <OrbitCard style={styles.section}>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>
                  {profile.completion_percentage}% respondido
                </Text>
                <Text style={styles.summaryMeta}>{profile.answers.length} respostas</Text>
              </View>
              <OrbitProgressBar value={profile.completion_percentage} />
            </OrbitCard>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Respostas</Text>
              {answersByDimension.length > 0 ? (
                <View style={styles.metricStack}>
                  {answersByDimension.map((item) => (
                    <MetricRow key={item.dimension} label={getDimensionLabel(item.dimension)} value={`${item.count} respostas`} />
                  ))}
                </View>
              ) : (
                <Text style={styles.helpText}>Nenhuma resposta registrada ainda.</Text>
              )}
            </OrbitCard>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Prioridades</Text>
              {priorityKeys.length > 0 ? (
                <View style={styles.chips}>
                  {priorityDimensionOptions.map((option) =>
                    priorityKeys.includes(option.key) ? (
                      <OrbitChip key={option.key} label={option.label} selected />
                    ) : null,
                  )}
                </View>
              ) : (
                <Text style={styles.helpText}>Nenhuma prioridade registrada ainda.</Text>
              )}
            </OrbitCard>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Dealbreakers</Text>
              {dealbreakerKeys.length > 0 ? (
                <View style={styles.chips}>
                  {dealbreakerOptions.map((option) =>
                    dealbreakerKeys.includes(option.key) ? (
                      <OrbitChip key={option.key} label={option.label} selected />
                    ) : null,
                  )}
                </View>
              ) : (
                <Text style={styles.helpText}>Nenhum limite registrado ainda.</Text>
              )}
            </OrbitCard>

            <OrbitButton
              label="Editar compatibilidade"
              variant="secondary"
              onPress={() => navigation.navigate("CompatibilitySettings")}
            />
          </>
        ) : null}
      </View>
    </OrbitScreen>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function buildAnswersByDimension(profile: CompatibilityProfileRead | null) {
  if (!profile) {
    return [];
  }

  const counts = profile.answers.reduce<Record<string, number>>((acc, answer) => {
    acc[answer.dimension] = (acc[answer.dimension] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([dimension, count]) => ({ dimension, count }));
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  summaryMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  metricStack: {
    gap: theme.spacing.sm,
  },
  metricRow: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  metricLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  helpText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
