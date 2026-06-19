import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitInput,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { BasicInfoScreenProps } from "../../navigation/types";
import { getCities, type CityRead } from "../../services/cityService";
import { theme } from "../../styles/theme";
import {
  formatDateToBirthDate,
  isAdultBirthDate,
  parseApiDateToDate,
  parseBirthDateToApi,
} from "../../utils/dateMask";

export default function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { basicInfo, setBasicInfo } = useOnboarding();
  const [publicName, setPublicName] = useState(basicInfo.publicName);
  const [birthDate, setBirthDate] = useState(basicInfo.birthDate);
  const [city, setCity] = useState(basicInfo.city);
  const [cityQuery, setCityQuery] = useState(basicInfo.city);
  const [cities, setCities] = useState<CityRead[]>([]);
  const [cityError, setCityError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canContinue =
    publicName.trim().length >= 2 && birthDate.trim().length > 0 && city.trim().length > 0;
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

    void loadCities();

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
      gender: "Prefiro não informar",
      bio: "",
    });
    navigation.navigate("IntentSelection");
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Seu perfil" subtitle="Etapa 2 de 5" onBack={navigation.goBack} />
      <OrbitProgressBar value={40} />

      <View style={styles.stack}>
        <View style={styles.copy}>
          <Text style={styles.title}>Só o essencial para começar.</Text>
          <Text style={styles.subtitle}>
            Depois você pode completar preferências e compatibilidade dentro do app.
          </Text>
        </View>

        <OrbitInput
          label="Nome"
          value={publicName}
          onChangeText={setPublicName}
          placeholder="Como você quer aparecer"
          autoCapitalize="words"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Data de nascimento</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [styles.selectBox, pressed && styles.pressed]}
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
          label="Cidade"
          value={cityQuery}
          onChangeText={(value) => {
            setCityQuery(value);
            if (value !== city) {
              setCity("");
            }
          }}
          placeholder="Digite e selecione uma cidade"
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
    fontWeight: "500",
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  selectBox: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.86,
  },
  selectText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  placeholder: {
    color: theme.colors.textSubtle,
  },
  cityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
