import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { genderOptions } from "../../constants/options";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitInput,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { getCities, type CityRead } from "../../services/cityService";
import { theme } from "../../styles/theme";
import type { BasicInfoScreenProps } from "../../navigation/types";
import type { GenderOption } from "../../types/profile";
import {
  formatDateToBirthDate,
  isAdultBirthDate,
  parseApiDateToDate,
  parseBirthDateToApi,
} from "../../utils/dateMask";

const bioSuggestions = [
  "Gosto de conversas leves, cafés bons e planos que façam sentido para os dois.",
  "Valorizo presença, bom humor e gente que sabe conversar com calma.",
  "Curto tecnologia, música e descobrir lugares novos sem pressa.",
];

export default function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { basicInfo, setBasicInfo } = useOnboarding();
  const [publicName, setPublicName] = useState(basicInfo.publicName);
  const [birthDate, setBirthDate] = useState(basicInfo.birthDate);
  const [city, setCity] = useState(basicInfo.city);
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<CityRead[]>([]);
  const [cityError, setCityError] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderOption>(basicInfo.gender);
  const [bio, setBio] = useState(basicInfo.bio);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canContinue =
    publicName.trim().length > 0 && birthDate.trim().length > 0 && city.trim().length > 0;
  const selectedDate = useMemo(
    () => parseApiDateToDate(birthDate) ?? new Date(1998, 0, 1),
    [birthDate],
  );

  useEffect(() => {
    let isActive = true;

    async function loadCities() {
      try {
        const nextCities = await getCities(cityQuery);
        if (isActive) {
          setCities(nextCities);
          setCityError(null);
        }
      } catch {
        if (isActive) {
          setCities([]);
          setCityError("Não foi possível carregar cidades agora.");
        }
      }
    }

    loadCities();

    return () => {
      isActive = false;
    };
  }, [cityQuery]);

  function updateBirthDate(_: DateTimePickerEvent, value?: Date) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (!value) {
      return;
    }

    setBirthDate(formatDateToBirthDate(value));
    setBirthDateError(null);
  }

  function selectCity(nextCity: CityRead) {
    setCity(nextCity.name);
    setCityQuery(nextCity.name);
    setCityError(null);
  }

  function applyBioSuggestion(suggestion: string) {
    setBio((current) => {
      const trimmed = current.trim();
      return trimmed.length > 0 ? `${trimmed} ${suggestion}` : suggestion;
    });
  }

  function continueToIntent() {
    if (!parseBirthDateToApi(birthDate)) {
      setBirthDateError("Informe uma data real no formato DD/MM/AAAA.");
      return;
    }

    if (!isAdultBirthDate(birthDate)) {
      setBirthDateError("Você precisa ter pelo menos 18 anos.");
      return;
    }

    setBasicInfo({
      publicName,
      birthDate,
      city,
      gender,
      bio,
    });
    navigation.navigate("IntentSelection");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Dados básicos" subtitle="Etapa 2 de 9" onBack={navigation.goBack} />
      <OrbitProgressBar value={22} />

        <View style={styles.form}>
        <OrbitInput label="Nome público" value={publicName} onChangeText={setPublicName} />
        <View style={styles.field}>
          <Text style={styles.label}>Data de nascimento</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDatePicker(true)}
            style={styles.selectBox}
          >
            <Text style={[styles.selectText, !birthDate && styles.placeholder]}>
              {birthDate || "Escolher no calendário"}
            </Text>
          </Pressable>
        </View>
        {showDatePicker ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            maximumDate={new Date()}
            onChange={updateBirthDate}
          />
        ) : null}
        <OrbitErrorMessage message={birthDateError} />

        <OrbitInput
          label="Buscar cidade"
          value={cityQuery}
          onChangeText={(value) => {
            setCityQuery(value);
            if (value !== city) {
              setCity("");
            }
          }}
          placeholder="Digite para filtrar e toque em uma opção"
        />
        <OrbitErrorMessage message={cityError} />
        <View style={styles.cityList}>
          {cities.slice(0, 6).map((option) => (
            <OrbitChip
              key={option.id}
              label={`${option.name}${option.state ? `, ${option.state}` : ""}`}
              selected={city === option.name}
              onPress={() => selectCity(option)}
            />
          ))}
        </View>

        <View style={styles.chips}>
          {genderOptions.map((option) => (
            <OrbitChip
              key={option}
              label={option}
              selected={gender === option}
              onPress={() => setGender(option)}
            />
          ))}
        </View>

        <OrbitInput
          label="Bio curta"
          value={bio}
          onChangeText={setBio}
          multiline
          style={styles.bio}
        />
        <OrbitCard style={styles.suggestions}>
          <Text style={styles.label}>Sugestões de bio</Text>
          <View style={styles.suggestionList}>
            {bioSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                onPress={() => applyBioSuggestion(suggestion)}
                style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </OrbitCard>

        <OrbitButton
          label="Continuar"
          disabled={!canContinue}
          onPress={continueToIntent}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  selectBox: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.055)",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  selectText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  placeholder: {
    color: theme.colors.textSubtle,
  },
  cityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  bio: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: theme.spacing.md,
  },
  suggestions: {
    gap: theme.spacing.md,
  },
  suggestionList: {
    gap: theme.spacing.sm,
  },
  suggestion: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: theme.spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
  suggestionText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
    fontWeight: "700",
  },
});
