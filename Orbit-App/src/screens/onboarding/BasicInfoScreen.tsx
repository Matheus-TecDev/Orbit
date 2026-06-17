import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { genderOptions } from "../../constants/options";
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
import type { BasicInfoScreenProps } from "../../navigation/types";
import type { GenderOption } from "../../types/profile";

export default function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { basicInfo, setBasicInfo } = useOnboarding();
  const [publicName, setPublicName] = useState(basicInfo.publicName);
  const [birthDate, setBirthDate] = useState(basicInfo.birthDate);
  const [city, setCity] = useState(basicInfo.city);
  const [gender, setGender] = useState<GenderOption>(basicInfo.gender);
  const [bio, setBio] = useState(basicInfo.bio);

  const canContinue =
    publicName.trim().length > 0 && birthDate.trim().length > 0 && city.trim().length > 0;

  function continueToIntent() {
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
      <OrbitHeader title="Dados básicos" subtitle="Etapa 2 de 7" onBack={navigation.goBack} />
      <OrbitProgressBar value={28} />

      <View style={styles.form}>
        <OrbitInput label="Nome público" value={publicName} onChangeText={setPublicName} />
        <OrbitInput
          label="Data de nascimento"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="DD/MM/AAAA"
        />
        <OrbitInput label="Cidade" value={city} onChangeText={setCity} />

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
});
