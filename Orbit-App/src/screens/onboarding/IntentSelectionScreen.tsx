import { useState } from "react";
import { StyleSheet, View } from "react-native";

import IntentCard from "../../components/onboarding/IntentCard";
import { OrbitButton, OrbitHeader, OrbitProgressBar, OrbitScreen } from "../../components/ui";
import { intentOptions } from "../../constants/options";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { theme } from "../../styles/theme";
import type { IntentSelectionScreenProps } from "../../navigation/types";
import type { IntentKey } from "../../types/profile";

export default function IntentSelectionScreen({
  navigation,
}: IntentSelectionScreenProps) {
  const { intent, setIntent } = useOnboarding();
  const [selectedIntent, setSelectedIntent] = useState<IntentKey>(intent);

  function continueToPreferences() {
    setIntent(selectedIntent);
    navigation.navigate("Preferences");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Sua intenção" subtitle="Etapa 3 de 9" onBack={navigation.goBack} />
      <OrbitProgressBar value={33} />

      <View style={styles.stack}>
        {intentOptions.map((intent) => (
          <IntentCard
            key={intent}
            intent={intent}
            selected={selectedIntent === intent}
            onPress={() => setSelectedIntent(intent)}
          />
        ))}

        <OrbitButton label="Continuar" onPress={continueToPreferences} />
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
