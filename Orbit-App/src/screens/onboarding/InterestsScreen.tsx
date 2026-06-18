import { Ionicons } from "@expo/vector-icons";
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
import { interestCategories } from "../../constants/interests";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { InterestsScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";

const minSelections = 3;
const maxSelections = 6;

export default function InterestsScreen({ navigation }: InterestsScreenProps) {
  const { interests, setInterests } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(interests.slice(0, maxSelections));
  const [localError, setLocalError] = useState<string | null>(null);

  function toggleInterest(interest: string) {
    setLocalError(null);
    setSelected((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= maxSelections) {
        setLocalError(`Escolha no máximo ${maxSelections} interesses principais.`);
        return current;
      }

      return [...current, interest];
    });
  }

  function continueToPhoto() {
    if (selected.length < minSelections) {
      setLocalError(`Escolha pelo menos ${minSelections} interesses para começar.`);
      return;
    }

    setInterests(selected);
    navigation.navigate("PhotoUpload");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Interesses" subtitle="Etapa 4 de 5" onBack={navigation.goBack} />
      <OrbitProgressBar value={80} />

      <View style={styles.stack}>
        <View style={styles.copy}>
          <Text style={styles.title}>Escolha seus sinais principais.</Text>
          <Text style={styles.subtitle}>
            Selecione de {minSelections} a {maxSelections}. Depois você pode detalhar melhor o perfil.
          </Text>
        </View>

        <View style={styles.counter}>
          <Ionicons name="checkmark-circle" color={theme.colors.accentPink} size={18} />
          <Text style={styles.counterText}>
            {selected.length}/{maxSelections} selecionados
          </Text>
        </View>

        {interestCategories.map((category) => (
          <OrbitCard key={category.title} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            <View style={styles.chips}>
              {category.options.map((interest) => (
                <OrbitChip
                  key={interest.value}
                  label={interest.label}
                  selected={selected.includes(interest.value)}
                  onPress={() => toggleInterest(interest.value)}
                />
              ))}
            </View>
          </OrbitCard>
        ))}

        <OrbitErrorMessage message={localError} />
        <OrbitButton
          label={`Continuar (${selected.length})`}
          disabled={selected.length < minSelections}
          onPress={continueToPhoto}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  copy: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "900",
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  counter: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  counterText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "900",
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
