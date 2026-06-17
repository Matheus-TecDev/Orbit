import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { theme } from "../../styles/theme";
import { priorityDimensionOptions } from "../../types/compatibility";
import type { CompatibilityPrioritiesScreenProps } from "../../navigation/types";

const maxPriorities = 5;

export default function CompatibilityPrioritiesScreen({
  navigation,
}: CompatibilityPrioritiesScreenProps) {
  const { compatibilityPriorities, setCompatibilityPriorities } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(Object.keys(compatibilityPriorities));
  const [localError, setLocalError] = useState<string | null>(null);

  function togglePriority(dimension: string) {
    setLocalError(null);
    setSelected((current) => {
      if (current.includes(dimension)) {
        return current.filter((item) => item !== dimension);
      }

      if (current.length >= maxPriorities) {
        setLocalError("Escolha no máximo 5 prioridades.");
        return current;
      }

      return [...current, dimension];
    });
  }

  function continueToQuestions() {
    setCompatibilityPriorities(
      selected.reduce<Record<string, number>>(
        (acc, dimension) => ({ ...acc, [dimension]: 5 }),
        {},
      ),
    );
    navigation.navigate("CompatibilityQuestions");
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="Prioridades"
        subtitle="Etapa 6 de 9"
        onBack={navigation.goBack}
      />
      <OrbitProgressBar value={67} />

      <View style={styles.stack}>
        <Text style={styles.title}>O que mais pesa para você em uma relação?</Text>
        <View style={styles.chips}>
          {priorityDimensionOptions.map((option) => (
            <OrbitChip
              key={option.key}
              label={option.label}
              selected={selected.includes(option.key)}
              onPress={() => togglePriority(option.key)}
            />
          ))}
        </View>
        <OrbitErrorMessage message={localError} />
        <OrbitButton label="Continuar" onPress={continueToQuestions} />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
    lineHeight: 24,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
