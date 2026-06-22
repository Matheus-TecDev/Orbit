import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import IntentCard from "../../components/onboarding/IntentCard";
import { OrbitButton, OrbitHeader, OrbitProgressBar, OrbitScreen } from "../../components/ui";
import { intentModeOptions } from "../../constants/options";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { IntentSelectionScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";
import type { IntentMode } from "../../types/profile";

export default function IntentSelectionScreen({
  navigation,
}: IntentSelectionScreenProps) {
  const { intentMode, setIntentMode } = useOnboarding();
  const [selectedIntent, setSelectedIntent] = useState<IntentMode>(intentMode);

  function continueToInterests() {
    setIntentMode(selectedIntent);
    navigation.navigate("Interests");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="O que você busca?" subtitle="Etapa 3 de 5" onBack={navigation.goBack} />
      <OrbitProgressBar value={60} />

      <View style={styles.stack}>
        <View style={styles.copy}>
          <Text style={styles.title}>O Orbit se adapta ao seu momento.</Text>
          <Text style={styles.subtitle}>
            Todos os modos são para relacionamentos. Sua escolha ajusta a curadoria, os critérios e o volume de pessoas apresentadas.
          </Text>
        </View>

        {intentModeOptions.map((intent) => (
          <IntentCard
            key={intent}
            intent={intent}
            selected={selectedIntent === intent}
            onPress={() => setSelectedIntent(intent)}
          />
        ))}

        <OrbitButton label="Continuar" onPress={continueToInterests} />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  copy: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "500",
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
