import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import CompatibilityQuestionCard from "../../components/profile/CompatibilityQuestionCard";
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
import type { CompatibilitySettingsScreenProps } from "../../navigation/types";
import {
  getCompatibilityQuestions,
  getMyCompatibilityProfile,
  saveCompatibilityAnswers,
  saveCompatibilityDealbreakers,
  saveCompatibilityPriorities,
} from "../../services/compatibilityService";
import { theme } from "../../styles/theme";
import {
  dealbreakerOptions,
  getDimensionLabel,
  priorityDimensionOptions,
  type CompatibilityQuestion,
} from "../../types/compatibility";

const maxPriorities = 5;

export default function CompatibilitySettingsScreen({
  navigation,
}: CompatibilitySettingsScreenProps) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<CompatibilityQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [priorities, setPriorities] = useState<Record<string, number>>({});
  const [dealbreakers, setDealbreakers] = useState<string[]>([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"answers" | "priorities" | "dealbreakers" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupedQuestions = useMemo(() => groupQuestionsByDimension(questions), [questions]);

  useEffect(() => {
    void loadCompatibility();
  }, [token]);

  async function loadCompatibility() {
    if (!token) {
      setError("Entre novamente para editar sua compatibilidade.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const [nextQuestions, profile] = await Promise.all([
        getCompatibilityQuestions(token),
        getMyCompatibilityProfile(token),
      ]);
      setQuestions(nextQuestions);
      setAnswers(
        profile.answers.reduce<Record<string, number>>(
          (acc, answer) => ({ ...acc, [answer.question_key]: answer.answer_value }),
          {},
        ),
      );
      setPriorities(
        profile.priorities.reduce<Record<string, number>>(
          (acc, priority) => ({ ...acc, [priority.dimension]: priority.weight }),
          {},
        ),
      );
      setDealbreakers(profile.dealbreakers.map((dealbreaker) => dealbreaker.rule_key));
      setCompletion(profile.completion_percentage);
    } catch {
      setError("Não foi possível carregar seus dados de compatibilidade.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(questionKey: string, value: number) {
    setMessage(null);
    setAnswers((current) => ({ ...current, [questionKey]: value }));
  }

  function togglePriority(dimension: string) {
    setMessage(null);
    setError(null);
    setPriorities((current) => {
      if (current[dimension]) {
        const next = { ...current };
        delete next[dimension];
        return next;
      }

      if (Object.keys(current).length >= maxPriorities) {
        setError("Escolha no máximo 5 prioridades.");
        return current;
      }

      return { ...current, [dimension]: 5 };
    });
  }

  function toggleDealbreaker(ruleKey: string) {
    setMessage(null);
    setDealbreakers((current) =>
      current.includes(ruleKey)
        ? current.filter((item) => item !== ruleKey)
        : [...current, ruleKey],
    );
  }

  async function saveAnswers() {
    if (!token) {
      setError("Entre novamente para salvar respostas.");
      return;
    }

    setSaving("answers");
    setError(null);
    setMessage(null);

    try {
      await saveCompatibilityAnswers(
        token,
        Object.entries(answers).map(([question_key, answer_value]) => ({
          question_key,
          answer_value,
        })),
      );
      setMessage("Respostas salvas.");
      await refreshProfileOnly(token);
    } catch {
      setError("Não foi possível salvar respostas.");
    } finally {
      setSaving(null);
    }
  }

  async function savePriorities() {
    if (!token) {
      setError("Entre novamente para salvar prioridades.");
      return;
    }

    setSaving("priorities");
    setError(null);
    setMessage(null);

    try {
      await saveCompatibilityPriorities(
        token,
        Object.entries(priorities).map(([dimension, weight]) => ({ dimension, weight })),
      );
      setMessage("Prioridades salvas.");
    } catch {
      setError("Não foi possível salvar prioridades.");
    } finally {
      setSaving(null);
    }
  }

  async function saveDealbreakers() {
    if (!token) {
      setError("Entre novamente para salvar incompatibilidades.");
      return;
    }

    setSaving("dealbreakers");
    setError(null);
    setMessage(null);

    try {
      await saveCompatibilityDealbreakers(
        token,
        dealbreakers.map((rule_key) => ({ rule_key, value: null })),
      );
      setMessage("Incompatibilidades salvas.");
    } catch {
      setError("Não foi possível salvar incompatibilidades.");
    } finally {
      setSaving(null);
    }
  }

  async function refreshProfileOnly(nextToken: string) {
    try {
      const profile = await getMyCompatibilityProfile(nextToken);
      setCompletion(profile.completion_percentage);
    } catch {
      return;
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Compatibilidade" subtitle="Ajuste seus sinais" onBack={navigation.goBack} />

      <View style={styles.stack}>
        {loading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </>
        ) : null}

        <OrbitErrorMessage message={error} />
        {message ? (
          <OrbitCard style={styles.successCard}>
            <Text style={styles.successText}>{message}</Text>
          </OrbitCard>
        ) : null}

        {!loading && questions.length === 0 ? (
          <OrbitEmptyState
            title="Compatibilidade ainda não carregada"
            description="Busque suas perguntas para editar respostas, prioridades e incompatibilidades."
            actionLabel="Tentar novamente"
            onAction={loadCompatibility}
            icon="sparkles-outline"
          />
        ) : null}

        {!loading && questions.length > 0 ? (
          <>
            <OrbitCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>
                  {completion >= 100 ? "Compatibilidade completa" : `${completion}% respondido`}
                </Text>
                <Text style={styles.summaryMeta}>{Object.keys(answers).length} respostas</Text>
              </View>
              <OrbitProgressBar value={completion} />
            </OrbitCard>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Prioridades</Text>
              <Text style={styles.sectionText}>Escolha até 5 pontos que mais pesam para você.</Text>
              <View style={styles.chips}>
                {priorityDimensionOptions.map((option) => (
                  <OrbitChip
                    key={option.key}
                    label={option.label}
                    selected={Boolean(priorities[option.key])}
                    onPress={() => togglePriority(option.key)}
                  />
                ))}
              </View>
              <OrbitButton
                compact
                variant="secondary"
                label={saving === "priorities" ? "Salvando..." : "Salvar prioridades"}
                loading={saving === "priorities"}
                onPress={savePriorities}
              />
            </OrbitCard>

            <View style={styles.questionStack}>
              <Text style={styles.sectionTitle}>Respostas</Text>
              {groupedQuestions.map((group) => (
                <View key={group.dimension} style={styles.group}>
                  <Text style={styles.groupTitle}>{getDimensionLabel(group.dimension)}</Text>
                  {group.questions.map((question) => (
                    <CompatibilityQuestionCard
                      key={question.key}
                      question={question}
                      value={answers[question.key] ?? 0}
                      onChange={(value) => updateAnswer(question.key, value)}
                    />
                  ))}
                </View>
              ))}
              <OrbitButton
                label={saving === "answers" ? "Salvando..." : "Salvar respostas"}
                loading={saving === "answers"}
                onPress={saveAnswers}
              />
            </View>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Incompatibilidades</Text>
              <Text style={styles.sectionText}>
                Marque pontos importantes. Usamos isso com cuidado no cálculo de recomendação.
              </Text>
              <View style={styles.chips}>
                {dealbreakerOptions.map((option) => (
                  <OrbitChip
                    key={option.key}
                    label={option.label}
                    selected={dealbreakers.includes(option.key)}
                    onPress={() => toggleDealbreaker(option.key)}
                  />
                ))}
              </View>
              <OrbitButton
                compact
                variant="secondary"
                label={saving === "dealbreakers" ? "Salvando..." : "Salvar incompatibilidades"}
                loading={saving === "dealbreakers"}
                onPress={saveDealbreakers}
              />
            </OrbitCard>
          </>
        ) : null}
      </View>
    </OrbitScreen>
  );
}

function groupQuestionsByDimension(questions: CompatibilityQuestion[]) {
  const grouped = new Map<string, CompatibilityQuestion[]>();
  for (const question of questions) {
    const current = grouped.get(question.dimension) ?? [];
    current.push(question);
    grouped.set(question.dimension, current);
  }

  return Array.from(grouped.entries()).map(([dimension, items]) => ({
    dimension,
    questions: items,
  }));
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  successCard: {
    padding: theme.spacing.md,
    borderColor: "rgba(57,217,138,0.32)",
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  summaryCard: {
    gap: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  summaryMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
  },
  sectionText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  questionStack: {
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.md,
  },
  groupTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});
