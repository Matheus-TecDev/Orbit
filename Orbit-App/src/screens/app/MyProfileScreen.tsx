import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ProfileCompletionCard from "../../components/profile/ProfileCompletionCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitInput,
  OrbitProgressBar,
  OrbitScreen,
  OrbitSectionTitle,
  SkeletonCard,
} from "../../components/ui";
import { interestCategories } from "../../constants/interests";
import { getIntentLabel } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { MyProfileScreenProps } from "../../navigation/types";
import { getMyCompatibilityProfile } from "../../services/compatibilityService";
import { updatePreference } from "../../services/preferenceService";
import { updateProfile } from "../../services/profileService";
import { theme } from "../../styles/theme";

export default function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { signOut, token, user, profile, preferences, isBootstrapping, loadCurrentUser } = useAuth();
  const [status, setStatus] = useState("Seu perfil pode evoluir aos poucos.");
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [compatibilityProgress, setCompatibilityProgress] = useState<number | null>(null);
  const [compatibilityAnswers, setCompatibilityAnswers] = useState(0);
  const [bioDraft, setBioDraft] = useState(profile?.bio ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests ?? []);
  const [savingSection, setSavingSection] = useState<"bio" | "interests" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const displayName = profile?.display_name ?? user?.full_name ?? "Perfil Orbit";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayAge = getAge(profile?.birth_date);
  const displayCity = profile?.city ?? "Cidade não informada";
  const displayIntent = getIntentLabel(profile?.intention);
  const displayInterests =
    selectedInterests.length > 0
      ? selectedInterests
      : preferences?.interests ?? [];
  const preferenceSummary = buildPreferenceSummary(preferences, profile?.intention);
  const completion = calculateProfileCompletion({
    profile,
    preferences,
    compatibilityProgress,
  });

  useEffect(() => {
    setBioDraft(profile?.bio ?? "");
    setSelectedInterests(profile?.interests ?? []);
  }, [profile]);

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

  const selectedInterestSet = useMemo(() => new Set(selectedInterests), [selectedInterests]);

  function toggleInterest(interest: string) {
    setSaveError(null);
    setStatus("Ajuste seus interesses e salve para melhorar recomendações.");
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= 20) {
        setSaveError("O backend permite até 20 interesses.");
        return current;
      }

      return [...current, interest];
    });
  }

  async function saveBio() {
    if (!token) {
      setSaveError("Entre novamente para salvar seu perfil.");
      return;
    }

    setSavingSection("bio");
    setSaveError(null);
    try {
      await updateProfile({ bio: bioDraft.trim() || null }, token);
      await loadCurrentUser();
      setStatus("Bio atualizada.");
    } catch {
      setSaveError("Não foi possível salvar a bio.");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveInterests() {
    if (!token) {
      setSaveError("Entre novamente para salvar interesses.");
      return;
    }

    setSavingSection("interests");
    setSaveError(null);
    try {
      await updateProfile({ interests: selectedInterests }, token);
      if (preferences) {
        await updatePreference({ interests: selectedInterests }, token);
      }
      await loadCurrentUser();
      setStatus("Interesses atualizados.");
    } catch {
      setSaveError("Não foi possível salvar interesses.");
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Meu perfil" subtitle="Complete no seu ritmo" />

      <View style={styles.stack}>
        {isBootstrapping ? <SkeletonCard lines={4} /> : null}

        <OrbitCard elevated style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{displayInitial}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.name}>
              {displayName}
              {displayAge ? `, ${displayAge}` : ""}
            </Text>
            <Text style={styles.meta}>{displayCity}</Text>
            <Text style={styles.intent}>{displayIntent}</Text>
          </View>
        </OrbitCard>

        <ProfileCompletionCard
          percentage={completion.percentage}
          suggestions={completion.suggestions}
        />

        <OrbitErrorMessage message={saveError} />

        <OrbitCard style={styles.sectionCard}>
          <OrbitSectionTitle
            title="Sobre mim"
            subtitle="Uma bio curta ajuda a recomendação a parecer mais humana."
          />
          <OrbitInput
            label="Bio"
            value={bioDraft}
            onChangeText={setBioDraft}
            placeholder="Conte algo leve sobre você"
            multiline
            style={styles.bioInput}
          />
          <OrbitButton
            compact
            variant="secondary"
            label={savingSection === "bio" ? "Salvando..." : "Salvar bio"}
            loading={savingSection === "bio"}
            onPress={saveBio}
          />
        </OrbitCard>

        <OrbitCard style={styles.sectionCard}>
          <OrbitSectionTitle
            title="Interesses"
            subtitle={`${selectedInterests.length}/20 selecionados para compatibilidade`}
          />
          <View style={styles.interestGroups}>
            {interestCategories.map((category) => (
              <View key={category.title} style={styles.interestGroup}>
                <Text style={styles.groupTitle}>{category.title}</Text>
                <View style={styles.chips}>
                  {category.options.map((interest) => (
                    <OrbitChip
                      key={interest.value}
                      label={interest.label}
                      selected={selectedInterestSet.has(interest.value)}
                      onPress={() => toggleInterest(interest.value)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
          <OrbitButton
            compact
            variant="secondary"
            label={savingSection === "interests" ? "Salvando..." : "Salvar interesses"}
            loading={savingSection === "interests"}
            onPress={saveInterests}
          />
        </OrbitCard>

        <OrbitCard style={styles.sectionCard}>
          <OrbitSectionTitle title="Preferências" subtitle={preferenceSummary} />
          {preferences ? (
            <View style={styles.preferenceGrid}>
              <PreferencePill label={`${preferences.min_age}-${preferences.max_age} anos`} />
              <PreferencePill label={`${preferences.max_distance_km} km`} />
              <PreferencePill label={preferences.city ?? "Sem filtro de cidade"} />
              <PreferencePill
                label={
                  preferences.preferred_genders.length > 0
                    ? preferences.preferred_genders.join(", ")
                    : "Sem filtro de gênero"
                }
              />
            </View>
          ) : (
            <Text style={styles.helpText}>Preferências mínimas serão criadas no onboarding.</Text>
          )}
          <OrbitButton
            compact
            variant="secondary"
            label="Preferências avançadas"
            onPress={() => setStatus("Edição avançada de preferências será adicionada aqui.")}
            icon={<Ionicons name="options" color={theme.colors.text} size={16} />}
          />
        </OrbitCard>

        {compatibilityLoading ? (
          <SkeletonCard lines={3} />
        ) : (
          <OrbitCard style={styles.sectionCard}>
            <OrbitSectionTitle
              title="Compatibilidade"
              subtitle={
                compatibilityProgress === null
                  ? "Sem respostas ainda"
                  : `${compatibilityProgress}% respondido · ${compatibilityAnswers} respostas`
              }
            />
            {compatibilityProgress !== null ? (
              <OrbitProgressBar value={compatibilityProgress} />
            ) : (
              <Text style={styles.helpText}>
                Responda perguntas quando quiser melhorar o ranking do Feed.
              </Text>
            )}
            <OrbitErrorMessage message={compatibilityError} />
            <OrbitButton
              compact
              variant="secondary"
              label="Responder compatibilidade"
              onPress={() => navigation.navigate("CompatibilitySettings")}
              icon={<Ionicons name="sparkles" color={theme.colors.text} size={16} />}
            />
          </OrbitCard>
        )}

        <OrbitCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Conta e privacidade</Text>
          <Text style={styles.status}>{status}</Text>
          <View style={styles.actionGrid}>
            <ProfileAction
              label="Privacidade"
              icon="shield-checkmark"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            />
            <ProfileAction
              label="Termos"
              icon="document-text"
              onPress={() => navigation.navigate("LegalTerms")}
            />
          </View>
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

function ProfileAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.profileAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} color={theme.colors.text} size={18} />
      <Text style={styles.profileActionText}>{label}</Text>
    </Pressable>
  );
}

function PreferencePill({ label }: { label: string }) {
  return (
    <View style={styles.preferencePill}>
      <Text style={styles.preferencePillText}>{label}</Text>
    </View>
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

type CompletionInput = {
  profile: {
    display_name: string;
    bio: string | null;
    birth_date: string | null;
    city: string | null;
    intention: string | null;
    photo_url: string | null;
    interests: string[];
  } | null;
  preferences: {
    interests: string[];
  } | null;
  compatibilityProgress: number | null;
};

function calculateProfileCompletion({
  profile,
  preferences,
  compatibilityProgress,
}: CompletionInput) {
  const checks = [
    { done: Boolean(profile?.display_name), suggestion: "Adicione seu nome público." },
    { done: Boolean(profile?.birth_date), suggestion: "Informe sua data de nascimento." },
    { done: Boolean(profile?.city), suggestion: "Informe sua cidade." },
    { done: Boolean(profile?.intention), suggestion: "Escolha sua intenção." },
    {
      done: Boolean(profile?.interests && profile.interests.length >= 3),
      suggestion: "Adicione pelo menos 3 interesses.",
    },
    { done: Boolean(profile?.bio), suggestion: "Escreva uma bio curta." },
    { done: Boolean(profile?.photo_url), suggestion: "Adicione fotos quando o upload estiver disponível." },
    { done: Boolean(preferences), suggestion: "Complete suas preferências." },
    {
      done: Boolean(compatibilityProgress && compatibilityProgress >= 50),
      suggestion: "Responda perguntas de compatibilidade.",
    },
  ];
  const doneCount = checks.filter((item) => item.done).length;

  return {
    percentage: Math.round((doneCount / checks.length) * 100),
    suggestions: checks.filter((item) => !item.done).map((item) => item.suggestion),
  };
}

type PreferenceSummaryInput = {
  min_age: number;
  max_age: number;
  max_distance_km: number;
  city: string | null;
  gender: string | null;
  preferred_genders: string[];
  intention: string | null;
} | null;

function buildPreferenceSummary(
  preferences: PreferenceSummaryInput,
  profileIntention: string | null | undefined,
) {
  if (!preferences) {
    return "Preferências mínimas serão criadas ao concluir o onboarding.";
  }

  const pieces = [
    `${preferences.min_age}-${preferences.max_age} anos`,
    preferences.city ?? "sem filtro de cidade",
  ];

  if (preferences.intention && preferences.intention !== profileIntention) {
    pieces.push(getIntentLabel(preferences.intention));
  }

  return pieces.join(" · ");
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 92,
    height: 112,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: "rgba(255,77,136,0.24)",
  },
  initial: {
    color: theme.colors.text,
    fontSize: 42,
    fontWeight: "900",
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "900",
    lineHeight: 28,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  intent: {
    alignSelf: "flex-start",
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
    textTransform: "uppercase",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.accentPinkSoft,
    borderWidth: 1,
    borderColor: "rgba(255,77,136,0.28)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  sectionCard: {
    gap: theme.spacing.md,
  },
  bioInput: {
    minHeight: 92,
    textAlignVertical: "top",
    paddingTop: theme.spacing.md,
  },
  interestGroups: {
    gap: theme.spacing.md,
  },
  interestGroup: {
    gap: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  preferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  preferencePill: {
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  preferencePillText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  helpText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  status: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  profileAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  profileActionText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
});
