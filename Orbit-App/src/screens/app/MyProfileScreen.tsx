import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import ProfileCompletionCard from "../../components/profile/ProfileCompletionCard";
import ProfileShortcutCard from "../../components/profile/ProfileShortcutCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { getIntentMode, intentModeLabels } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { MyProfileScreenProps } from "../../navigation/types";
import { getMyCompatibilityProfile } from "../../services/compatibilityService";
import { theme } from "../../styles/theme";
import {
  buildListSummary,
  buildPreferenceSummary,
  calculateProfileCompletion,
  getProfileMeta,
  getProfileName,
  summarizeBio,
} from "../../utils/profileSummary";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { signOut, token, user, profile, preferences, isBootstrapping } = useAuth();
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [compatibilityProgress, setCompatibilityProgress] = useState<number | null>(null);
  const [compatibilityAnswers, setCompatibilityAnswers] = useState(0);
  const displayName = getProfileName(profile, user);
  const displayInitial = displayName.charAt(0).toUpperCase();
  const profilePhotoUrl = resolveMediaUrl(profile?.photo_url);
  const intentMode = getIntentMode(profile?.intent_mode ?? profile?.intention);
  const completion = calculateProfileCompletion({
    profile,
    preferences,
    compatibilityProgress,
  });

  useEffect(() => {
    let isActive = true;

    async function loadCompatibilitySummary() {
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
          setCompatibilityAnswers(0);
          setCompatibilityError("Não foi possível carregar compatibilidade.");
        }
      } finally {
        if (isActive) {
          setCompatibilityLoading(false);
        }
      }
    }

    void loadCompatibilitySummary();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Meu perfil" subtitle="Resumo e ajustes do seu Orbit" />

      <View style={styles.stack}>
        {isBootstrapping ? <SkeletonCard lines={4} /> : null}

        <OrbitCard elevated style={styles.heroCard}>
          <View style={styles.avatar}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initial}>{displayInitial}</Text>
            )}
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.meta}>{getProfileMeta(profile)}</Text>
            <OrbitChip label={intentModeLabels[intentMode]} selected />
          </View>
        </OrbitCard>

        <ProfileCompletionCard
          percentage={completion.percentage}
          suggestions={completion.suggestions}
        />

        {!profile?.photo_url ? (
          <OrbitCard style={styles.warningCard}>
            <Ionicons name="camera-outline" color={theme.colors.purpleLight} size={18} />
            <Text style={styles.warningText}>
              Adicione uma foto real em Dados pessoais para completar seu perfil.
            </Text>
          </OrbitCard>
        ) : null}

        <OrbitCard style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <Ionicons name="chatbubble-ellipses" color={theme.colors.purpleLight} size={18} />
            <Text style={styles.sectionTitle}>Sobre mim</Text>
          </View>
          <Text style={styles.bioText}>{summarizeBio(profile?.bio)}</Text>
        </OrbitCard>

        <View style={styles.shortcutStack}>
          <ProfileShortcutCard
            title="Dados pessoais"
            summary={getProfileMeta(profile)}
            cta="Editar"
            icon="person-outline"
            onPress={() => navigation.navigate("ProfilePersonalData")}
          />
          <ProfileShortcutCard
            title="O que estou buscando agora"
            summary={intentModeLabels[intentMode]}
            cta="Editar"
            icon="heart-outline"
            onPress={() => navigation.navigate("ProfileIntent")}
          />
          <ProfileShortcutCard
            title="Interesses"
            summary={buildListSummary(profile?.interests ?? [], "Nenhum interesse selecionado.")}
            cta="Editar"
            icon="sparkles-outline"
            onPress={() => navigation.navigate("ProfileInterests")}
          />
          <ProfileShortcutCard
            title="Compatibilidade"
            summary={
              compatibilityProgress === null
                ? "Sem respostas ainda"
                : `${compatibilityProgress}% respondido · ${compatibilityAnswers} respostas`
            }
            cta="Ver"
            icon="analytics-outline"
            onPress={() => navigation.navigate("ProfileCompatibility")}
          />
          <ProfileShortcutCard
            title="Preferências"
            summary={buildPreferenceSummary(preferences, profile?.intention)}
            cta="Editar"
            icon="options-outline"
            onPress={() => navigation.navigate("ProfilePreferences")}
          />
          <ProfileShortcutCard
            title="Privacidade e segurança"
            summary="Termos, política de privacidade e próximos controles de segurança."
            cta="Ver"
            icon="shield-checkmark-outline"
            onPress={() => navigation.navigate("ProfilePrivacySecurity")}
          />
        </View>

        {compatibilityLoading ? <SkeletonCard lines={2} /> : null}
        <OrbitErrorMessage message={compatibilityError} />

        <OrbitButton
          variant="danger"
          label="Sair"
          onPress={signOut}
          icon={<Ionicons name="log-out" color={theme.colors.text} size={17} />}
        />
      </View>
    </OrbitScreen>
  );
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
    borderColor: "rgba(124,92,252,0.25)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initial: {
    color: theme.colors.text,
    fontSize: 42,
    fontWeight: "500",
  },
  heroCopy: {
    flex: 1,
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "500",
    lineHeight: 28,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  bioCard: {
    gap: theme.spacing.sm,
  },
  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  bioText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  shortcutStack: {
    gap: theme.spacing.md,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderColor: "rgba(124,92,252,0.28)",
  },
  warningText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
