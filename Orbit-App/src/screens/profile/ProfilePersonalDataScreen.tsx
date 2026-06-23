import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitInput,
  OrbitScreen,
} from "../../components/ui";
import { genderOptions } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { ProfilePersonalDataScreenProps } from "../../navigation/types";
import { updateProfile } from "../../services/profileService";
import { theme } from "../../styles/theme";
import type { GenderOption } from "../../types/profile";
import {
  isAdultBirthDate,
  maskBirthDate,
  parseBirthDateToApi,
} from "../../utils/dateMask";

export default function ProfilePersonalDataScreen({
  navigation,
}: ProfilePersonalDataScreenProps) {
  const { token, profile, user, loadCurrentUser } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? user?.full_name ?? "");
  const [birthDate, setBirthDate] = useState(formatApiDate(profile?.birth_date));
  const [city, setCity] = useState(profile?.city ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState<string | null>(profile?.gender ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? user?.full_name ?? "");
    setBirthDate(formatApiDate(profile?.birth_date));
    setCity(profile?.city ?? "");
    setBio(profile?.bio ?? "");
    setGender(profile?.gender ?? null);
  }, [profile, user]);

  async function savePersonalData() {
    if (!token) {
      setError("Entre novamente para salvar seus dados.");
      return;
    }

    const name = displayName.trim();
    const parsedBirthDate = birthDate.trim() ? parseBirthDateToApi(birthDate) : null;

    if (name.length < 2) {
      setError("Informe um nome público com pelo menos 2 caracteres.");
      return;
    }

    if (birthDate.trim() && (!parsedBirthDate || !isAdultBirthDate(birthDate))) {
      setError("Informe uma data de nascimento válida para maior de 18 anos.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile(
        {
          display_name: name,
          birth_date: parsedBirthDate,
          city: city.trim() || null,
          bio: bio.trim() || null,
          gender,
        },
        token,
      );
      await loadCurrentUser();
      setMessage("Dados pessoais atualizados.");
    } catch {
      setError("Não foi possível salvar seus dados pessoais.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Dados pessoais" subtitle="Informações principais do perfil" onBack={navigation.goBack} />

      <View style={styles.stack}>
        <OrbitCard style={styles.photoCard}>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" color={theme.colors.textMuted} size={34} />
          </View>
          <View style={styles.photoCopy}>
            <Text style={styles.sectionTitle}>Foto do perfil</Text>
            <Text style={styles.helpText}>
              Upload real ainda não está disponível nesta etapa. Quando houver foto salva, ela será exibida aqui.
            </Text>
          </View>
        </OrbitCard>

        <OrbitCard style={styles.formCard}>
          <OrbitInput
            label="Nome"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Seu nome público"
          />
          <OrbitInput
            label="Data de nascimento"
            value={birthDate}
            onChangeText={(value) => setBirthDate(maskBirthDate(value))}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
          />
          <OrbitInput
            label="Cidade"
            value={city}
            onChangeText={setCity}
            placeholder="Sua cidade"
          />
          <View style={styles.field}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.chips}>
              {genderOptions.map((option: GenderOption) => (
                <OrbitChip
                  key={option}
                  label={option}
                  selected={gender === option}
                  onPress={() => setGender((current) => (current === option ? null : option))}
                />
              ))}
            </View>
          </View>
          <OrbitInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Conte algo leve sobre você"
            multiline
            style={styles.bioInput}
          />
        </OrbitCard>

        {message ? (
          <OrbitCard style={styles.successCard}>
            <Text style={styles.successText}>{message}</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={error} />

        <OrbitButton
          label={saving ? "Salvando..." : "Salvar alterações"}
          loading={saving}
          onPress={savePersonalData}
        />
      </View>
    </OrbitScreen>
  );
}

function formatApiDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  photoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  photoPlaceholder: {
    width: 78,
    height: 92,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.25)",
  },
  photoCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  helpText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  formCard: {
    gap: theme.spacing.lg,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  bioInput: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: theme.spacing.md,
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
