import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitChip,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { theme } from "../../styles/theme";
import { dealbreakerOptions } from "../../types/compatibility";
import type { CompatibilityDealbreakersScreenProps } from "../../navigation/types";

export default function CompatibilityDealbreakersScreen({
  navigation,
}: CompatibilityDealbreakersScreenProps) {
  const { compatibilityDealbreakers, setCompatibilityDealbreakers } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(compatibilityDealbreakers);

  function toggleDealbreaker(ruleKey: string) {
    setSelected((current) =>
      current.includes(ruleKey)
        ? current.filter((item) => item !== ruleKey)
        : [...current, ruleKey],
    );
  }

  function continueToPhotos() {
    setCompatibilityDealbreakers(selected);
    navigation.navigate("PhotoUpload");
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="Incompatibilidades"
        subtitle="Etapa 8 de 9"
        onBack={navigation.goBack}
      />
      <OrbitProgressBar value={89} />

      <View style={styles.stack}>
        <Text style={styles.title}>O que seria incompatível para você?</Text>
        <View style={styles.chips}>
          {dealbreakerOptions.map((option) => (
            <OrbitChip
              key={option.key}
              label={option.label}
              selected={selected.includes(option.key)}
              onPress={() => toggleDealbreaker(option.key)}
            />
          ))}
        </View>
        <OrbitButton label="Continuar" onPress={continueToPhotos} />
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
