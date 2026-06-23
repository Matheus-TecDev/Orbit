import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import { interestCategories } from "../../constants/interests";
import { useAuth } from "../../contexts/AuthContext";
import type { ProfileInterestsScreenProps } from "../../navigation/types";
import { updatePreference } from "../../services/preferenceService";
import { updateProfile } from "../../services/profileService";
import { theme } from "../../styles/theme";

const minSelections = 3;
const maxSelections = 6;

export default function ProfileInterestsScreen({
  navigation,
}: ProfileInterestsScreenProps) {
  const { token, profile, preferences, loadCurrentUser } = useAuth();
  const [selected, setSelected] = useState<string[]>((profile?.interests ?? []).slice(0, maxSelections));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    setSelected((profile?.interests ?? []).slice(0, maxSelections));
  }, [profile]);

  function toggleInterest(interest: string) {
    setError(null);
    setMessage(null);
    setSelected((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= maxSelections) {
        setError(`Escolha no máximo ${maxSelections} interesses principais.`);
        return current;
      }

      return [...current, interest];
    });
  }

  async function saveInterests() {
    if (!token) {
      setError("Entre novamente para salvar interesses.");
      return;
    }

    if (selected.length < minSelections) {
      setError(`Escolha pelo menos ${minSelections} interesses.`);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile({ interests: selected }, token);
      if (preferences) {
        await updatePreference({ interests: selected }, token);
      }
      await loadCurrentUser();
      setMessage("Interesses atualizados.");
    } catch {
      setError("Não foi possível salvar interesses.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OrbitScreen>
      <OrbitHeader
        title="Interesses"
        subtitle="Selecione de 3 a 6 sinais que mais combinam com você"
        onBack={navigation.goBack}
      />

      <View style={styles.stack}>
        <View style={styles.counter}>
          <Ionicons name="checkmark-circle" color={theme.colors.purpleLight} size={18} />
          <Text style={styles.counterText}>
            {selected.length}/{maxSelections} selecionados
          </Text>
        </View>

        {interestCategories.map((category) => (
          <OrbitCard key={category.title} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            <View style={styles.chips}>
              {category.options.map((interest) => (
                <OrbitChip
                  key={interest.value}
                  label={interest.label}
                  selected={selectedSet.has(interest.value)}
                  onPress={() => toggleInterest(interest.value)}
                />
              ))}
            </View>
          </OrbitCard>
        ))}

        {message ? (
          <OrbitCard style={styles.successCard}>
            <Text style={styles.successText}>{message}</Text>
          </OrbitCard>
        ) : null}
        <OrbitErrorMessage message={error} />

        <OrbitButton
          label={saving ? "Salvando..." : `Salvar interesses (${selected.length})`}
          loading={saving}
          disabled={selected.length < minSelections}
          onPress={saveInterests}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  counter: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  counterText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  category: {
    gap: theme.spacing.md,
    width: "100%",
  },
  categoryTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  categorySubtitle: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
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
