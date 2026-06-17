import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import CompatibilityQuestionCard from "../../components/profile/CompatibilityQuestionCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { getCompatibilityQuestions } from "../../services/compatibilityService";
import { theme } from "../../styles/theme";
import { getDimensionLabel, type CompatibilityQuestion } from "../../types/compatibility";
import type { CompatibilityQuestionsScreenProps } from "../../navigation/types";

type AnswerMap = Record<string, number>;

export default function CompatibilityQuestionsScreen({
  navigation,
}: CompatibilityQuestionsScreenProps) {
  const { token } = useAuth();
  const { compatibilityAnswers, setCompatibilityAnswers } = useOnboarding();
  const [questions, setQuestions] = useState<CompatibilityQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>(compatibilityAnswers);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const groupedQuestions = useMemo(() => groupQuestionsByDimension(questions), [questions]);

  useEffect(() => {
    loadQuestions();
  }, [token]);

  async function loadQuestions() {
    if (!token) {
      setLoadError("Entre novamente para carregar as perguntas de compatibilidade.");
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const nextQuestions = await getCompatibilityQuestions(token);
      setQuestions(nextQuestions);
    } catch {
      setLoadError("Não foi possível carregar perguntas de compatibilidade.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(questionKey: string, value: number) {
    setAnswers((current) => ({ ...current, [questionKey]: value }));
  }

  function continueToDealbreakers() {
    setCompatibilityAnswers(answers);
    navigation.navigate("CompatibilityDealbreakers");
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="Compatibilidade"
        subtitle="Etapa 7 de 9"
        onBack={navigation.goBack}
      />
      <OrbitProgressBar value={78} />

      <View style={styles.stack}>
        {loading ? (
          <OrbitCard>
            <Text style={styles.status}>Carregando perguntas...</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={loadError} />
        {loadError ? (
          <OrbitButton variant="secondary" label="Tentar novamente" onPress={loadQuestions} />
        ) : null}

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
          label="Continuar"
          disabled={questions.length === 0 || Boolean(loadError)}
          onPress={continueToDealbreakers}
        />
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
    marginTop: theme.spacing.xl,
  },
  group: {
    gap: theme.spacing.md,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  status: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
});
