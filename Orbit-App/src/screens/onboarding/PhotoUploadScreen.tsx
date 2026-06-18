import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { PhotoUploadScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";

export default function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { completeOnboarding, loading, error, clearError } = useAuth();
  const { basicInfo, buildPreferencePayload, buildProfilePayload } = useOnboarding();
  const [placeholderSelected, setPlaceholderSelected] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const initial = basicInfo.publicName.trim().charAt(0).toUpperCase() || "O";

  async function finishProfile() {
    clearError();
    setLocalError(null);

    try {
      await completeOnboarding(
        buildProfilePayload(),
        buildPreferencePayload(),
      );
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível concluir seu perfil.",
      );
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Foto" subtitle="Etapa 5 de 5" onBack={navigation.goBack} />
      <OrbitProgressBar value={100} />

      <View style={styles.stack}>
        <View style={styles.copy}>
          <Text style={styles.title}>Comece com um placeholder.</Text>
          <Text style={styles.subtitle}>
            Upload real pode entrar depois. Por enquanto, o Orbit cria uma presença visual para o feed.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setPlaceholderSelected((current) => !current)}
          style={({ pressed }) => [styles.photoPreview, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>
              {placeholderSelected ? "Placeholder ativo" : "Adicionar depois"}
            </Text>
            <Text style={styles.photoText}>
              Seu perfil será criado com uma presença visual simples. Você poderá melhorar fotos ao completar o perfil.
            </Text>
          </View>
          <View style={[styles.toggle, placeholderSelected && styles.toggleOn]}>
            {placeholderSelected ? (
              <Ionicons name="checkmark" color={theme.colors.text} size={16} />
            ) : null}
          </View>
        </Pressable>

        <OrbitCard style={styles.note}>
          <Ionicons name="lock-closed" color={theme.colors.textMuted} size={18} />
          <Text style={styles.noteText}>
            O onboarding termina aqui. Preferências avançadas e perguntas de compatibilidade ficam no perfil.
          </Text>
        </OrbitCard>

        <OrbitErrorMessage message={localError ?? error} />

        <OrbitButton
          label={loading ? "Salvando perfil..." : "Entrar no Orbit"}
          loading={loading}
          onPress={finishProfile}
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
    fontWeight: "900",
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  photoPreview: {
    minHeight: 156,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  avatar: {
    width: 86,
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
  photoCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  photoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  photoText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleOn: {
    backgroundColor: theme.colors.orbitRed,
    borderColor: theme.colors.orbitRed,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  noteText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
