import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import {
  OrbitButton,
  OrbitCard,
  OrbitHeader,
  OrbitProgressBar,
  OrbitScreen,
} from "../../components/ui";
import { theme } from "../../styles/theme";
import type { TermsConsentScreenProps } from "../../navigation/types";

export default function TermsConsentScreen({ navigation }: TermsConsentScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <OrbitScreen>
      <OrbitHeader title="Consentimentos" subtitle="Etapa 1 de 7" />
      <OrbitProgressBar value={14} />

      <View style={styles.stack}>
        <OrbitCard elevated>
          <Text style={styles.cardTitle}>Termos e privacidade</Text>
          <Text style={styles.text}>
            Você confirma que leu os termos, a política de privacidade e consente
            com o uso de dados para recomendações por IA mockadas nesta versão.
          </Text>
          <View style={styles.links}>
            <Pressable onPress={() => navigation.navigate("LegalTerms")}>
              <Text style={styles.link}>Termos de uso</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("PrivacyPolicy")}>
              <Text style={styles.link}>Política de privacidade</Text>
            </Pressable>
          </View>
        </OrbitCard>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => setAccepted((current) => !current)}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted ? (
              <Ionicons name="checkmark" color={theme.colors.text} size={16} />
            ) : null}
          </View>
          <Text style={styles.checkText}>
            Aceito os termos, a política de privacidade e as recomendações por IA.
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
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
    marginBottom: theme.spacing.sm,
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
    marginTop: theme.spacing.md,
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
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.045)",
    padding: theme.spacing.md,
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
    backgroundColor: theme.colors.orbitRedDark,
    borderColor: theme.colors.orbitRed,
    ...theme.shadows.glow,
  },
  checkText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
