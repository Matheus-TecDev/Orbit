import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ageOptions,
  distanceOptions,
  genderOptions,
  getDistanceLabel,
} from "../../constants/options";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { ProfilePreferencesScreenProps } from "../../navigation/types";
import { updatePreference } from "../../services/preferenceService";
import { theme } from "../../styles/theme";
import type { GenderOption } from "../../types/profile";

export default function ProfilePreferencesScreen({
  navigation,
}: ProfilePreferencesScreenProps) {
  const { token, preferences, loadCurrentUser } = useAuth();
  const [minAge, setMinAge] = useState(String(preferences?.min_age ?? 18));
  const [maxAge, setMaxAge] = useState(String(preferences?.max_age ?? 85));
  const [distance, setDistance] = useState(String(preferences?.max_distance_km ?? ""));
  const [genders, setGenders] = useState<string[]>(preferences?.preferred_genders ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minAgeNumber = Number.parseInt(minAge, 10);
  const maxAgeNumber = Number.parseInt(maxAge, 10);
  const hasValidAges = minAgeNumber <= maxAgeNumber;
  const hasDistance = preferences?.max_distance_km !== null && preferences?.max_distance_km !== undefined;
  const distanceOptionsForCurrentValue = useMemo(() => {
    if (!distance || distanceOptions.includes(distance as (typeof distanceOptions)[number])) {
      return distanceOptions;
    }

    return [distance, ...distanceOptions] as const;
  }, [distance]);

  useEffect(() => {
    setMinAge(String(preferences?.min_age ?? 18));
    setMaxAge(String(preferences?.max_age ?? 85));
    setDistance(String(preferences?.max_distance_km ?? ""));
    setGenders(preferences?.preferred_genders ?? []);
  }, [preferences]);

  function toggleGender(gender: GenderOption) {
    setError(null);
    setMessage(null);
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

  async function savePreferences() {
    if (!token) {
      setError("Entre novamente para salvar preferências.");
      return;
    }

    if (!preferences) {
      setError("Preferências ainda não existem para edição.");
      return;
    }

    if (!hasValidAges) {
      setError("A idade mínima não pode ser maior que a máxima.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updatePreference(
        {
          min_age: minAgeNumber,
          max_age: maxAgeNumber,
          preferred_genders: genders,
          ...(hasDistance && distance ? { max_distance_km: Number.parseInt(distance, 10) } : {}),
        },
        token,
      );
      await loadCurrentUser();
      setMessage("Preferências atualizadas.");
    } catch {
      setError("Não foi possível salvar preferências.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Preferências" subtitle="Filtros reais usados pela curadoria" onBack={navigation.goBack} />

      <View style={styles.stack}>
        {!preferences ? (
          <OrbitEmptyState
            title="Preferências não encontradas"
            description="Conclua o onboarding para criar preferências reais antes de editá-las."
            icon="options-outline"
          />
        ) : (
          <>
            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Faixa etária</Text>
              <Text style={styles.hint}>Escolha uma combinação válida entre 18 e 85 anos.</Text>
              <View style={styles.row}>
                <OptionScroller label="Mínima" options={ageOptions} selected={minAge} onSelect={setMinAge} />
                <OptionScroller label="Máxima" options={ageOptions} selected={maxAge} onSelect={setMaxAge} />
              </View>
              {!hasValidAges ? (
                <Text style={styles.error}>A idade mínima não pode ser maior que a máxima.</Text>
              ) : null}
            </OrbitCard>

            <OrbitCard style={styles.section}>
              <Text style={styles.sectionTitle}>Gêneros preferidos</Text>
              <Text style={styles.hint}>Deixe vazio para não filtrar por gênero.</Text>
              <View style={styles.chips}>
                {genderOptions.map((option: GenderOption) => (
                  <OrbitChip
                    key={option}
                    label={option}
                    selected={genders.includes(option)}
                    onPress={() => toggleGender(option)}
                  />
                ))}
              </View>
            </OrbitCard>

            {preferences.city ? (
              <OrbitCard style={styles.section}>
                <Text style={styles.sectionTitle}>Cidade</Text>
                <Text style={styles.valueText}>{preferences.city}</Text>
              </OrbitCard>
            ) : null}

            {hasDistance ? (
              <OrbitCard style={styles.section}>
                <Text style={styles.sectionTitle}>Distância máxima</Text>
                <Text style={styles.hint}>Este filtro só aparece porque já existe dado real salvo.</Text>
                <OptionScroller
                  label="Distância"
                  options={distanceOptionsForCurrentValue}
                  selected={distance}
                  onSelect={setDistance}
                  getLabel={getDistanceLabel}
                />
              </OrbitCard>
            ) : null}
          </>
        )}

        {message ? (
          <OrbitCard style={styles.successCard}>
            <Text style={styles.successText}>{message}</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={error} />

        {preferences ? (
          <OrbitButton
            label={saving ? "Salvando..." : "Salvar preferências"}
            loading={saving}
            disabled={!hasValidAges}
            onPress={savePreferences}
          />
        ) : null}
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
  stack: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
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
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  hint: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  valueText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  successCard: {
    borderColor: "rgba(76,217,100,0.28)",
    backgroundColor: "rgba(76,217,100,0.10)",
  },
  successText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
});
