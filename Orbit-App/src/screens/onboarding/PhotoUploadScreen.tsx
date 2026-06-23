import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
import { ApiRequestError } from "../../services/apiClient";
import { createProfile, updateProfile } from "../../services/profileService";
import { uploadProfilePhoto } from "../../services/profilePhotoService";
import { theme } from "../../styles/theme";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { token, profile, completeOnboarding, loadCurrentUser, loading, error, clearError } = useAuth();
  const { basicInfo, buildPreferencePayload, buildProfilePayload } = useOnboarding();
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(profile?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const initial = basicInfo.publicName.trim().charAt(0).toUpperCase() || "O";
  const previewUrl = resolveMediaUrl(uploadedPhotoUrl);
  const canFinish = Boolean(uploadedPhotoUrl) && !uploading && !loading;

  async function selectAndUploadPhoto() {
    if (!token) {
      setLocalError("Entre novamente para enviar sua foto.");
      return;
    }

    clearError();
    setLocalError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setLocalError("Permita acesso à galeria para escolher sua foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.86,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const profilePayload = {
        ...buildProfilePayload(),
        photo_url: uploadedPhotoUrl ?? profile?.photo_url ?? null,
      };
      await saveProfileDraft(profilePayload);
      const asset = result.assets[0];
      const uploadedProfile = await uploadProfilePhoto(
        {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        },
        token,
      );
      setUploadedPhotoUrl(uploadedProfile.photo_url);
      await loadCurrentUser();
    } catch (caughtError) {
      setLocalError(toPhotoErrorMessage(caughtError));
    } finally {
      setUploading(false);
    }
  }

  async function finishProfile() {
    clearError();
    setLocalError(null);

    if (!uploadedPhotoUrl) {
      setLocalError("Adicione uma foto real para concluir seu perfil.");
      return;
    }

    try {
      await completeOnboarding(
        {
          ...buildProfilePayload(),
          photo_url: uploadedPhotoUrl,
        },
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
          <Text style={styles.title}>Adicione sua foto principal.</Text>
          <Text style={styles.subtitle}>
            Escolha uma foto real da galeria. Ela será usada no Feed, matches e conversas.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar foto do perfil"
          onPress={selectAndUploadPhoto}
          disabled={uploading || loading}
          style={({ pressed }) => [styles.photoPreview, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            {previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initial}>{initial}</Text>
            )}
          </View>
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>
              {uploadedPhotoUrl ? "Foto enviada" : "Selecionar foto"}
            </Text>
            <Text style={styles.photoText}>
              {uploading
                ? "Enviando sua foto com segurança..."
                : "Toque para escolher uma imagem JPG, PNG ou WebP de até 5 MB."}
            </Text>
          </View>
          <View style={[styles.toggle, uploadedPhotoUrl && styles.toggleOn]}>
            {uploadedPhotoUrl ? (
              <Ionicons name="checkmark" color={theme.colors.text} size={16} />
            ) : uploading ? (
              <Ionicons name="cloud-upload-outline" color={theme.colors.textMuted} size={16} />
            ) : null}
          </View>
        </Pressable>

        <OrbitCard style={styles.note}>
          <Ionicons name="lock-closed" color={theme.colors.textMuted} size={18} />
          <Text style={styles.noteText}>
            Para novos perfis, a foto é obrigatória antes de entrar no Orbit.
          </Text>
        </OrbitCard>

        <OrbitErrorMessage message={localError ?? error} />

        <OrbitButton
          label={loading ? "Salvando perfil..." : "Entrar no Orbit"}
          loading={loading}
          disabled={!canFinish}
          onPress={finishProfile}
        />
      </View>
    </OrbitScreen>
  );

  async function saveProfileDraft(profilePayload: ReturnType<typeof buildProfilePayload>) {
    if (!token) {
      throw new Error("Entre novamente para enviar sua foto.");
    }

    if (profile) {
      return updateProfile(profilePayload, token);
    }

    try {
      return await createProfile(profilePayload, token);
    } catch (caughtError) {
      if (
        caughtError instanceof ApiRequestError &&
        (caughtError.status === 400 || caughtError.status === 409)
      ) {
        return updateProfile(profilePayload, token);
      }

      throw caughtError;
    }
  }
}

function toPhotoErrorMessage(caughtError: unknown) {
  if (caughtError instanceof ApiRequestError) {
    return caughtError.message;
  }

  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "Não foi possível enviar sua foto. Tente novamente.";
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
  photoCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  photoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
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
    backgroundColor: theme.colors.purple,
    borderColor: theme.colors.purple,
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
