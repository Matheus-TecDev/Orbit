import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { interestCategories } from "../../data/mockInterests";
import { theme } from "../../styles/theme";
import type { InterestsScreenProps } from "../../navigation/types";

const minSelections = 4;
const maxSelections = 12;

export default function InterestsScreen({ navigation }: InterestsScreenProps) {
  const { interests, setInterests } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(interests);
  const [localError, setLocalError] = useState<string | null>(null);

  function toggleInterest(interest: string) {
    setLocalError(null);
    setSelected((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= maxSelections) {
        setLocalError(`Escolha no máximo ${maxSelections} interesses.`);
        return current;
      }

      return [...current, interest];
    });
  }

  function continueToQuestions() {
    if (selected.length < minSelections) {
      setLocalError(`Escolha pelo menos ${minSelections} interesses para melhorar as recomendações.`);
      return;
    }

    setInterests(selected);
    navigation.navigate("CompatibilityPriorities");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Interesses" subtitle="Etapa 5 de 9" onBack={navigation.goBack} />
      <OrbitProgressBar value={56} />

      <View style={styles.stack}>
        <View style={styles.copy}>
          <Text style={styles.title}>Escolha interesses que aparecem na sua vida real.</Text>
          <Text style={styles.subtitle}>
            Isso ajuda o Orbit a explicar compatibilidade com mais precisão. Selecione de {minSelections} a {maxSelections}.
          </Text>
        </View>
        {interestCategories.map((category) => (
          <OrbitCard key={category.title} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            <View style={styles.chips}>
              {category.options.map((interest) => (
                <OrbitChip
                  key={interest}
                  label={interest}
                  selected={selected.includes(interest)}
                  onPress={() => toggleInterest(interest)}
                />
              ))}
            </View>
          </OrbitCard>
        ))}
        <OrbitErrorMessage message={localError} />
        <OrbitButton
          label={`Continuar (${selected.length})`}
          disabled={selected.length < minSelections}
          onPress={continueToQuestions}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  copy: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
    lineHeight: 24,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  category: {
    gap: theme.spacing.md,
  },
  categoryTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  categorySubtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
