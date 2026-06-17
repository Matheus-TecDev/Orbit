import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import ProfileCompletionCard from "../../components/profile/ProfileCompletionCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
  OrbitSectionTitle,
  SkeletonCard,
} from "../../components/ui";
import { getIntentLabel } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import { currentUser } from "../../data/mockUsers";
import type { MyProfileScreenProps } from "../../navigation/types";
import { getMyCompatibilityProfile } from "../../services/compatibilityService";
import { theme } from "../../styles/theme";

export default function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { signOut, token, user, profile, preferences, isBootstrapping } = useAuth();
  const [status, setStatus] = useState("Configurações locais prontas.");
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [compatibilityProgress, setCompatibilityProgress] = useState<number | null>(null);
  const [compatibilityAnswers, setCompatibilityAnswers] = useState(0);
  const displayName = profile?.display_name ?? user?.full_name ?? currentUser.name;
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayAge = getAge(profile?.birth_date) ?? currentUser.age;
  const displayCity = profile?.city ?? currentUser.city;
  const displayIntent = getIntentLabel(profile?.intention ?? currentUser.intent);
  const displayBio = profile?.bio ?? currentUser.bio;
  const displayInterests =
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : currentUser.interests;
  const completion = calculateProfileCompletion(profile, preferences);
  const preferenceSummary = buildPreferenceSummary(preferences);

  useEffect(() => {
    let isActive = true;

    async function loadCompatibility() {
      if (!token) {
        setCompatibilityProgress(null);
        setCompatibilityError("Entre novamente para carregar compatibilidade.");
        return;
      }

      setCompatibilityLoading(true);
      setCompatibilityError(null);

      try {
        const profileData = await getMyCompatibilityProfile(token);
        if (!isActive) {
          return;
        }

        setCompatibilityProgress(profileData.completion_percentage);
        setCompatibilityAnswers(profileData.answers.length);
      } catch {
        if (isActive) {
          setCompatibilityProgress(null);
          setCompatibilityError("Não foi possível carregar compatibilidade.");
        }
      } finally {
        if (isActive) {
          setCompatibilityLoading(false);
        }
      }
    }

    void loadCompatibility();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Meu perfil" subtitle="Dados reais do Orbit" />

      <View style={styles.stack}>
        {isBootstrapping ? <SkeletonCard lines={4} /> : null}
        <OrbitCard elevated style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{displayInitial}</Text>
          </View>
          <Text style={styles.name}>
            {displayName}, {displayAge}
          </Text>
          <Text style={styles.meta}>
            {displayCity} · {displayIntent}
          </Text>
          <Text style={styles.email}>{user?.email ?? "E-mail não carregado"}</Text>
          <Text style={styles.bio}>{displayBio}</Text>
          <View style={styles.chips}>
            {displayInterests.map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </OrbitCard>

        <ProfileCompletionCard
          percentage={completion.percentage}
          suggestions={completion.suggestions}
        />

        <OrbitCard style={styles.progressCard}>
          <OrbitSectionTitle title="Preferências" subtitle={preferenceSummary} />
          <View style={styles.chips}>
            {(preferences?.interests ?? currentUser.interests).map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </OrbitCard>

        {compatibilityLoading ? (
          <SkeletonCard lines={3} />
        ) : (
          <OrbitCard style={styles.progressCard}>
            <OrbitSectionTitle
              title="Compatibilidade"
              subtitle={
                compatibilityProgress === 100
                  ? "Compatibilidade completa"
                  : compatibilityProgress === null
                    ? "Sem dados carregados"
                    : `${compatibilityProgress}% respondido · ${compatibilityAnswers} respostas`
              }
            />
            {compatibilityProgress !== null ? (
              <OrbitProgressBar value={compatibilityProgress} />
            ) : (
              <Text style={styles.helpText}>
                Responda algumas perguntas para melhorar a ordem das recomendações.
              </Text>
            )}
            <OrbitErrorMessage message={compatibilityError} />
            <OrbitButton
              compact
              variant="secondary"
              label="Melhorar compatibilidade"
              onPress={() => navigation.navigate("CompatibilitySettings")}
              icon={<Ionicons name="sparkles" color={theme.colors.text} size={16} />}
            />
          </OrbitCard>
        )}

        <SettingsSection title="Conta">
          <Text style={styles.status}>{user?.email ?? "E-mail não carregado"}</Text>
        </SettingsSection>

        <SettingsSection title="Perfil">
          <OrbitButton
            variant="secondary"
            label="Editar perfil"
            onPress={() => setStatus("Edição de perfil completa será adicionada em breve.")}
            icon={<Ionicons name="create" color={theme.colors.text} size={17} />}
          />
          <OrbitButton
            variant="secondary"
            label="Preferências"
            onPress={() => setStatus("Edição de preferências completa será adicionada em breve.")}
            icon={<Ionicons name="options" color={theme.colors.text} size={17} />}
          />
        </SettingsSection>

        <SettingsSection title="Compatibilidade">
          <OrbitButton
            variant="secondary"
            label="Editar compatibilidade"
            onPress={() => navigation.navigate("CompatibilitySettings")}
            icon={<Ionicons name="sparkles" color={theme.colors.text} size={17} />}
          />
        </SettingsSection>

        <SettingsSection title="Privacidade">
          <OrbitButton
            variant="secondary"
            label="Privacidade"
            onPress={() => navigation.navigate("PrivacyPolicy")}
            icon={<Ionicons name="shield-checkmark" color={theme.colors.text} size={17} />}
          />
        </SettingsSection>

        <SettingsSection title="Segurança">
          <OrbitButton
            variant="secondary"
            label="Segurança em breve"
            disabled
            onPress={() => undefined}
            icon={<Ionicons name="lock-closed" color={theme.colors.text} size={17} />}
          />
        </SettingsSection>

        <SettingsSection title="Termos e política">
          <OrbitButton
            variant="secondary"
            label="Termos de serviço"
            onPress={() => navigation.navigate("LegalTerms")}
            icon={<Ionicons name="document-text" color={theme.colors.text} size={17} />}
          />
          <OrbitButton
            variant="secondary"
            label="Política de privacidade"
            onPress={() => navigation.navigate("PrivacyPolicy")}
            icon={<Ionicons name="shield" color={theme.colors.text} size={17} />}
          />
        </SettingsSection>

        <OrbitCard style={styles.actions}>
          <Text style={styles.status}>{status}</Text>
          <OrbitButton
            variant="danger"
            label="Sair"
            onPress={signOut}
            icon={<Ionicons name="log-out" color={theme.colors.text} size={17} />}
          />
        </OrbitCard>
      </View>
    </OrbitScreen>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <OrbitCard style={styles.actions}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </OrbitCard>
  );
}

function getAge(birthDate: string | null | undefined) {
  if (!birthDate) {
    return null;
  }

  const parsed = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  const hasNotHadBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age;
}

type PreferenceSummaryInput = {
  min_age: number;
  max_age: number;
  city: string | null;
  gender: string | null;
  intention: string | null;
} | null;

type ProfileCompletionInput = {
  display_name: string;
  bio: string | null;
  birth_date: string | null;
  gender: string | null;
  city: string | null;
  intention: string | null;
  interests: string[];
} | null;

type PreferenceCompletionInput = {
  min_age: number;
  max_age: number;
  city: string | null;
  gender: string | null;
  intention: string | null;
  interests: string[];
} | null;

function calculateProfileCompletion(
  profile: ProfileCompletionInput,
  preferences: PreferenceCompletionInput,
) {
  const checks = [
    { done: Boolean(profile?.display_name), suggestion: "Adicione seu nome público." },
    { done: Boolean(profile?.bio), suggestion: "Escreva uma bio curta." },
    { done: Boolean(profile?.birth_date), suggestion: "Informe sua data de nascimento." },
    { done: Boolean(profile?.city), suggestion: "Informe sua cidade." },
    { done: Boolean(profile?.gender), suggestion: "Informe seu gênero." },
    { done: Boolean(profile?.intention), suggestion: "Escolha sua intenção." },
    {
      done: Boolean(profile?.interests && profile.interests.length > 0),
      suggestion: "Escolha alguns interesses.",
    },
    { done: Boolean(preferences), suggestion: "Complete suas preferências." },
  ];
  const doneCount = checks.filter((item) => item.done).length;

  return {
    percentage: Math.round((doneCount / checks.length) * 100),
    suggestions: checks.filter((item) => !item.done).map((item) => item.suggestion),
  };
}

function buildPreferenceSummary(preferences: PreferenceSummaryInput) {
  if (!preferences) {
    return "Preferências locais até a API retornar dados.";
  }

  const location = preferences.city ?? "qualquer cidade";
  const gender = preferences.gender ?? "todos os gêneros";
  const intention = getIntentLabel(preferences.intention);

  return `${preferences.min_age}-${preferences.max_age} anos · ${location} · ${gender} · ${intention}`;
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.orbitRedSoft,
    borderWidth: 1,
    borderColor: "rgba(225,6,0,0.46)",
    ...theme.shadows.glow,
  },
  initial: {
    color: theme.colors.text,
    fontSize: 42,
    fontWeight: "900",
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "900",
  },
  meta: {
    color: theme.colors.orbitRed,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  email: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  bio: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
    textAlign: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  progressCard: {
    gap: theme.spacing.md,
  },
  helpText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  actions: {
    gap: theme.spacing.md,
  },
  status: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
});
