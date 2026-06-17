import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import ProfilePhotoCard from "../../components/profile/ProfilePhotoCard";
import {
  OrbitButton,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { theme } from "../../styles/theme";
import type { PhotoUploadScreenProps } from "../../navigation/types";
import type { UserPhotoSlot } from "../../types/profile";

const initialSlots: UserPhotoSlot[] = [
  { id: "photo-1", label: "Foto 1", isPrimary: true, filled: true },
  { id: "photo-2", label: "Foto 2", isPrimary: false, filled: false },
  { id: "photo-3", label: "Foto 3", isPrimary: false, filled: false },
  { id: "photo-4", label: "Foto 4", isPrimary: false, filled: false },
  { id: "photo-5", label: "Foto 5", isPrimary: false, filled: false },
  { id: "photo-6", label: "Foto 6", isPrimary: false, filled: false },
];

export default function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { completeOnboarding, loading, error, clearError } = useAuth();
  const { buildProfilePayload, buildPreferencePayload } = useOnboarding();
  const [slots, setSlots] = useState<UserPhotoSlot[]>(initialSlots);

  function toggleSlot(slotId: string) {
    clearError();
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId ? { ...slot, filled: !slot.filled } : slot,
      ),
    );
  }

  async function finishProfile() {
    await completeOnboarding(buildProfilePayload(), buildPreferencePayload());
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Fotos" subtitle="Etapa 7 de 7" onBack={navigation.goBack} />
      <OrbitProgressBar value={100} />

      <View style={styles.stack}>
        <Text style={styles.helper}>Upload visual fake para representar seu perfil.</Text>
        <View style={styles.grid}>
          {slots.map((slot) => (
            <ProfilePhotoCard
              key={slot.id}
              slot={slot}
              onPress={() => toggleSlot(slot.id)}
            />
          ))}
        </View>

        <OrbitErrorMessage message={error} />

        <OrbitButton
          label={loading ? "Salvando perfil..." : "Finalizar perfil"}
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
    marginTop: theme.spacing.xxl,
  },
  helper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
