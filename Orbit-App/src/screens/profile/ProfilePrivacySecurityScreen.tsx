import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps } from "react";

import {
  OrbitCard,
  OrbitHeader,
  OrbitScreen,
} from "../../components/ui";
import type { ProfilePrivacySecurityScreenProps } from "../../navigation/types";
import { theme } from "../../styles/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function ProfilePrivacySecurityScreen({
  navigation,
}: ProfilePrivacySecurityScreenProps) {
  return (
    <OrbitScreen>
      <OrbitHeader title="Privacidade e segurança" subtitle="Documentos e controles disponíveis" onBack={navigation.goBack} />

      <View style={styles.stack}>
        <SecurityAction
          title="Termos de uso"
          summary="Leia as condições de uso atuais do Orbit."
          icon="document-text-outline"
          onPress={() => navigation.navigate("LegalTerms")}
        />
        <SecurityAction
          title="Política de privacidade"
          summary="Veja como seus dados são tratados nesta versão."
          icon="shield-checkmark-outline"
          onPress={() => navigation.navigate("PrivacyPolicy")}
        />

        <OrbitCard style={styles.futureCard}>
          <Text style={styles.sectionTitle}>Controles futuros</Text>
          <Text style={styles.helpText}>
            Bloquear, denunciar e excluir conta ainda não estão funcionais nesta etapa e ficam marcados como evolução futura para evitar ações falsas.
          </Text>
          <View style={styles.futureList}>
            <FutureItem label="Bloquear usuário" />
            <FutureItem label="Denunciar perfil" />
            <FutureItem label="Excluir conta" />
          </View>
        </OrbitCard>
      </View>
    </OrbitScreen>
  );
}

function SecurityAction({
  title,
  summary,
  icon,
  onPress,
}: {
  title: string;
  summary: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <OrbitCard style={styles.actionCard}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} color={theme.colors.purpleLight} size={19} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <Ionicons name="chevron-forward" color={theme.colors.textMuted} size={17} />
      </OrbitCard>
    </Pressable>
  );
}

function FutureItem({ label }: { label: string }) {
  return (
    <View style={styles.futureItem}>
      <Text style={styles.futureText}>{label}</Text>
      <Text style={styles.futureBadge}>Futuro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  actionCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.25)",
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  summary: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  futureCard: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  helpText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  futureList: {
    gap: theme.spacing.sm,
  },
  futureItem: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  futureText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  futureBadge: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});
