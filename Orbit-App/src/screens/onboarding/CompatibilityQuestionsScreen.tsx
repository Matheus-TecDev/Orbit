import { useState } from "react";
import { StyleSheet, View } from "react-native";

import CompatibilityQuestionCard from "../../components/profile/CompatibilityQuestionCard";
import { OrbitButton, OrbitHeader, OrbitProgressBar, OrbitScreen } from "../../components/ui";
import { mockQuestions } from "../../data/mockQuestions";
import { theme } from "../../styles/theme";
import type { CompatibilityQuestionsScreenProps } from "../../navigation/types";

type AnswerMap = Record<string, number>;

const initialAnswers: AnswerMap = mockQuestions.reduce<AnswerMap>(
  (acc, question) => ({ ...acc, [question.id]: 3 }),
  {},
);

export default function CompatibilityQuestionsScreen({
  navigation,
}: CompatibilityQuestionsScreenProps) {
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);

  function updateAnswer(questionId: string, value: number) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="Compatibilidade"
        subtitle="Etapa 6 de 7"
        onBack={navigation.goBack}
      />
      <OrbitProgressBar value={84} />

      <View style={styles.stack}>
        {mockQuestions.map((question) => (
          <CompatibilityQuestionCard
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => updateAnswer(question.id, value)}
          />
        ))}

        <OrbitButton label="Continuar" onPress={() => navigation.navigate("PhotoUpload")} />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});
