import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import IntentCard from "../../components/onboarding/IntentCard";
import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { getIntentMode, intentModeOptions } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { ProfileIntentScreenProps } from "../../navigation/types";
import { updateProfile } from "../../services/profileService";
import { theme } from "../../styles/theme";
import type { IntentMode } from "../../types/profile";

export default function ProfileIntentScreen({ navigation }: ProfileIntentScreenProps) {
  const { token, profile, loadCurrentUser } = useAuth();
  const [selectedIntent, setSelectedIntent] = useState<IntentMode>(
    getIntentMode(profile?.intent_mode ?? profile?.intention),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedIntent(getIntentMode(profile?.intent_mode ?? profile?.intention));
  }, [profile]);

  async function saveIntent() {
    if (!token) {
      setError("Entre novamente para salvar seu modo.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile({ intent_mode: selectedIntent }, token);
      await loadCurrentUser();
      setMessage("Modo atualizado. O Feed será recarregado com esse objetivo.");
    } catch {
      setError("Não foi possível atualizar o que você está buscando.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="O que estou buscando agora"
        subtitle="Seu modo ajusta recomendações sem apagar matches ou conversas"
        onBack={navigation.goBack}
      />

      <View style={styles.stack}>
        <OrbitCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Escolha o momento mais honesto para agora.</Text>
          <Text style={styles.infoText}>
            Essa escolha muda a curadoria do Feed e pode ser alterada quando seu objetivo mudar.
          </Text>
        </OrbitCard>

        {intentModeOptions.map((intent) => (
          <IntentCard
            key={intent}
            intent={intent}
            selected={selectedIntent === intent}
            onPress={() => setSelectedIntent(intent)}
          />
        ))}

        {message ? (
          <OrbitCard style={styles.successCard}>
            <Text style={styles.successText}>{message}</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={error} />

        <OrbitButton
          label={saving ? "Salvando..." : "Salvar modo"}
          loading={saving}
          onPress={saveIntent}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  infoCard: {
    gap: theme.spacing.sm,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
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
