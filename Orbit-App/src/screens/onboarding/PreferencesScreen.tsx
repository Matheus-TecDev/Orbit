import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ageOptions,
  distanceOptions,
  genderOptions,
  getDistanceLabel,
} from "../../constants/options";
import {
  OrbitButton,
  OrbitChip,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { PreferencesScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";
import type { GenderOption } from "../../types/profile";

export default function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const { preferences, setPreferences } = useOnboarding();
  const [minAge, setMinAge] = useState(preferences.minAge);
  const [maxAge, setMaxAge] = useState(preferences.maxAge);
  const [distance, setDistance] = useState(preferences.distance);
  const [genders, setGenders] = useState<GenderOption[]>(preferences.genders);
  const minAgeNumber = Number.parseInt(minAge, 10);
  const maxAgeNumber = Number.parseInt(maxAge, 10);
  const hasValidAges = minAgeNumber <= maxAgeNumber;

  function toggleGender(gender: GenderOption) {
    setGenders((current) => {
      if (gender === "Prefiro não informar") {
        return current.includes(gender) ? [] : [gender];
      }

      const withoutPrivate = current.filter((item) => item !== "Prefiro não informar");
      return withoutPrivate.includes(gender)
        ? withoutPrivate.filter((item) => item !== gender)
        : [...withoutPrivate, gender];
    });
  }

  function continueToInterests() {
    setPreferences({
      minAge,
      maxAge,
      distance,
      genders,
    });
    navigation.navigate("Interests");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Preferências" subtitle="Opcional" onBack={navigation.goBack} />
      <OrbitProgressBar value={60} />

      <View style={styles.form}>
        <Text style={styles.title}>Faixa de idade</Text>
        <Text style={styles.hint}>Escolha uma combinação válida entre 18 e 85 anos.</Text>
        <View style={styles.row}>
          <OptionScroller label="Mínima" options={ageOptions} selected={minAge} onSelect={setMinAge} />
          <OptionScroller label="Máxima" options={ageOptions} selected={maxAge} onSelect={setMaxAge} />
        </View>
        {!hasValidAges ? (
          <Text style={styles.error}>A idade mínima não pode ser maior que a máxima.</Text>
        ) : null}

        <Text style={styles.title}>Distância máxima</Text>
        <Text style={styles.hint}>Use um raio prático para ampliar ou focar recomendações.</Text>
        <OptionScroller
          label="Distância"
          options={distanceOptions}
          selected={distance}
          onSelect={setDistance}
          getLabel={getDistanceLabel}
        />

        <Text style={styles.label}>Gêneros de interesse</Text>
        <Text style={styles.hint}>
          Deixe vazio para não filtrar por gênero nesta etapa.
        </Text>
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

        <OrbitButton label="Continuar" disabled={!hasValidAges} onPress={continueToInterests} />
      </View>
    </OrbitScreen>
  );
}

type OptionScrollerProps = {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  getLabel?: (value: string) => string;
};

function OptionScroller({
  label,
  options,
  selected,
  onSelect,
  getLabel = (value) => value,
}: OptionScrollerProps) {
  return (
    <View style={styles.selector}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
        {options.map((option) => (
          <OrbitChip
            key={option}
            label={getLabel(option)}
            selected={selected === option}
            onPress={() => onSelect(option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  selector: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  optionRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  hint: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
