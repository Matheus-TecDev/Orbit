import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  connectionOptions,
  genderOptions,
  intentLabels,
} from "../../constants/options";
import {
  OrbitButton,
  OrbitChip,
  OrbitHeader,
  OrbitInput,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { theme } from "../../styles/theme";
import type { PreferencesScreenProps } from "../../navigation/types";
import type { GenderOption, IntentKey } from "../../types/profile";

export default function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const { preferences, setPreferences } = useOnboarding();
  const [minAge, setMinAge] = useState(preferences.minAge);
  const [maxAge, setMaxAge] = useState(preferences.maxAge);
  const [distance, setDistance] = useState(preferences.distance);
  const [genders, setGenders] = useState<GenderOption[]>(preferences.genders);
  const [connection, setConnection] = useState<IntentKey>(preferences.connection);

  function toggleGender(gender: GenderOption) {
    setGenders((current) =>
      current.includes(gender)
        ? current.filter((item) => item !== gender)
        : [...current, gender],
    );
  }

  function continueToInterests() {
    setPreferences({
      minAge,
      maxAge,
      distance,
      genders,
      connection,
    });
    navigation.navigate("Interests");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Preferências" subtitle="Etapa 4 de 9" onBack={navigation.goBack} />
      <OrbitProgressBar value={44} />

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.inputHalf}>
            <OrbitInput
              label="Idade mínima"
              value={minAge}
              onChangeText={setMinAge}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.inputHalf}>
            <OrbitInput
              label="Idade máxima"
              value={maxAge}
              onChangeText={setMaxAge}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <OrbitInput
          label="Distância máxima em km"
          value={distance}
          onChangeText={setDistance}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Gêneros de interesse</Text>
        <View style={styles.chips}>
          {genderOptions.map((option) => (
            <OrbitChip
              key={option}
              label={option}
              selected={genders.includes(option)}
              onPress={() => toggleGender(option)}
            />
          ))}
        </View>

        <Text style={styles.label}>Tipo de conexão</Text>
        <View style={styles.chips}>
          {connectionOptions.map((option) => (
            <OrbitChip
              key={option}
              label={intentLabels[option]}
              selected={connection === option}
              onPress={() => setConnection(option)}
            />
          ))}
        </View>
        <OrbitButton label="Continuar" onPress={continueToInterests} />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
