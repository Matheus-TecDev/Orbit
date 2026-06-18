import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import type { TermsConsentScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";

export default function TermsConsentScreen({ navigation }: TermsConsentScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <OrbitScreen>
      <OrbitHeader title="Antes de começar" subtitle="Etapa 1 de 5" />
      <OrbitProgressBar value={20} />

      <View style={styles.stack}>
        <OrbitCard elevated style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" color={theme.colors.accentPink} size={22} />
          </View>
          <Text style={styles.cardTitle}>Compatibilidade com transparência</Text>
          <Text style={styles.text}>
            O Orbit usa seu perfil, preferências, interesses e interações para ordenar
            recomendações de dating e explicar por que alguém combina com você.
          </Text>
          <View style={styles.links}>
            <Pressable onPress={() => navigation.navigate("LegalTerms")}>
              <Text style={styles.link}>Termos</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("PrivacyPolicy")}>
              <Text style={styles.link}>Privacidade</Text>
            </Pressable>
          </View>
        </OrbitCard>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => setAccepted((current) => !current)}
          style={({ pressed }) => [styles.checkRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted ? (
              <Ionicons name="checkmark" color={theme.colors.text} size={16} />
            ) : null}
          </View>
          <Text style={styles.checkText}>
            Aceito o uso desses dados para compatibilidade e recomendações.
          </Text>
        </Pressable>

        <OrbitButton
          label="Continuar"
          disabled={!accepted}
          onPress={() => navigation.navigate("BasicInfo")}
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
  card: {
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,77,136,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,77,136,0.24)",
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "900",
    lineHeight: 28,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  link: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.md,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: theme.colors.orbitRed,
    borderColor: theme.colors.orbitRed,
  },
  checkText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
