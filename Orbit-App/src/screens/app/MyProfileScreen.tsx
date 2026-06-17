import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { intentLabels } from "../../constants/options";
import { currentUser } from "../../data/mockUsers";
import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
  OrbitSectionTitle,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../styles/theme";
import type { MyProfileScreenProps } from "../../navigation/types";

export default function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { signOut, user, profile, preferences } = useAuth();
  const [status, setStatus] = useState("Perfil pronto para edição mockada.");
  const displayName = profile?.display_name ?? user?.full_name ?? currentUser.name;
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayAge = getAge(profile?.birth_date) ?? currentUser.age;
  const displayCity = profile?.city ?? currentUser.city;
  const displayIntent = profile?.intention ?? intentLabels[currentUser.intent];
  const displayBio = profile?.bio ?? currentUser.bio;
  const displayInterests =
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : currentUser.interests;
  const profileProgress = profile && preferences ? 100 : currentUser.profileProgress;
  const preferenceSummary = buildPreferenceSummary(preferences);

  return (
    <OrbitScreen>
      <OrbitHeader title="Meu perfil" subtitle="Dados reais do Orbit AI" />

      <View style={styles.stack}>
        <OrbitCard elevated style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{displayInitial}</Text>
          </View>
          <Text style={styles.name}>
            {displayName}, {displayAge}
          </Text>
          <Text style={styles.meta}>{displayCity} · {displayIntent}</Text>
          <Text style={styles.email}>{user?.email ?? "E-mail não carregado"}</Text>
          <Text style={styles.bio}>{displayBio}</Text>
          <View style={styles.chips}>
            {displayInterests.map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </OrbitCard>

        <OrbitCard style={styles.progressCard}>
          <OrbitSectionTitle
            title="Progresso do perfil"
            subtitle={`${profileProgress}% completo`}
          />
          <OrbitProgressBar value={profileProgress} />
        </OrbitCard>

        <OrbitCard style={styles.progressCard}>
          <OrbitSectionTitle title="Preferências" subtitle={preferenceSummary} />
          <View style={styles.chips}>
            {(preferences?.interests ?? currentUser.interests).map((interest) => (
              <OrbitChip key={interest} label={interest} selected />
            ))}
          </View>
        </OrbitCard>

        <OrbitCard style={styles.actions}>
          <Text style={styles.status}>{status}</Text>
          <OrbitButton
            variant="secondary"
            label="Editar perfil"
            onPress={() => setStatus("Edição de perfil mockada selecionada.")}
            icon={<Ionicons name="create" color={theme.colors.text} size={17} />}
          />
          <OrbitButton
            variant="secondary"
            label="Preferências"
            onPress={() => setStatus("Preferências mockadas selecionadas.")}
            icon={<Ionicons name="options" color={theme.colors.text} size={17} />}
          />
          <OrbitButton
            variant="secondary"
            label="Privacidade"
            onPress={() => navigation.navigate("PrivacyPolicy")}
            icon={<Ionicons name="shield-checkmark" color={theme.colors.text} size={17} />}
          />
          <OrbitButton
            variant="secondary"
            label="Segurança"
            onPress={() => setStatus("Segurança mockada selecionada.")}
            icon={<Ionicons name="lock-closed" color={theme.colors.text} size={17} />}
          />
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
});

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

function buildPreferenceSummary(preferences: PreferenceSummaryInput) {
  if (!preferences) {
    return "Preferências locais até a API retornar dados.";
  }

  const location = preferences.city ?? "qualquer cidade";
  const gender = preferences.gender ?? "todos os gêneros";
  const intention = preferences.intention ?? "conexões abertas";

  return `${preferences.min_age}-${preferences.max_age} anos · ${location} · ${gender} · ${intention}`;
}
