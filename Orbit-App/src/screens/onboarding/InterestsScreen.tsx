import { useState } from "react";
import { StyleSheet, View } from "react-native";

import InterestSelector from "../../components/onboarding/InterestSelector";
import { OrbitButton, OrbitHeader, OrbitProgressBar, OrbitScreen } from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { mockInterests } from "../../data/mockInterests";
import { theme } from "../../styles/theme";
import type { InterestsScreenProps } from "../../navigation/types";

export default function InterestsScreen({ navigation }: InterestsScreenProps) {
  const { interests, setInterests } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(interests);

  function toggleInterest(interest: string) {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  function continueToQuestions() {
    setInterests(selected);
    navigation.navigate("CompatibilityQuestions");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Interesses" subtitle="Etapa 5 de 7" onBack={navigation.goBack} />
      <OrbitProgressBar value={70} />

      <View style={styles.stack}>
        <InterestSelector
          interests={mockInterests}
          selected={selected}
          onToggle={toggleInterest}
        />
        <OrbitButton
          label="Continuar"
          disabled={selected.length === 0}
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
});
