import { Ionicons } from "@expo/vector-icons";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { OrbitCard, OrbitHeader, OrbitScreen } from "../../components/ui";
import type {
  AppStackParamList,
  AuthStackParamList,
  OnboardingStackParamList,
} from "../../navigation/types";
import { theme } from "../../styles/theme";

type LegalNavigation = NavigationProp<
  AuthStackParamList & OnboardingStackParamList & AppStackParamList
>;

type PrivacyOption = {
  key: "profileVisible" | "approximateCity" | "compatibilityData";
  title: string;
  description: string;
};

const privacyOptions: PrivacyOption[] = [
  {
    key: "profileVisible",
    title: "Perfil visível no Feed",
    description: "Controle local para indicar se seu perfil deve aparecer em recomendações.",
  },
  {
    key: "approximateCity",
    title: "Usar cidade aproximada",
    description: "Evita comunicar localização precisa em telas públicas do app.",
  },
  {
    key: "compatibilityData",
    title: "Dados para compatibilidade",
    description: "Permite que respostas e preferências melhorem recomendações e score.",
  },
];

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<LegalNavigation>();
  const [settings, setSettings] = useState<Record<PrivacyOption["key"], boolean>>({
    profileVisible: true,
    approximateCity: true,
    compatibilityData: true,
  });

  function toggleSetting(key: PrivacyOption["key"]) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Privacidade" subtitle="Preferências e política" onBack={navigation.goBack} />

      <View style={styles.stack}>
        <OrbitCard style={styles.section}>
          <Text style={styles.title}>Controles locais</Text>
          <Text style={styles.copy}>
            Estes controles organizam a experiência de privacidade no app. Quando a API de
            preferências avançadas estiver disponível, eles poderão ser persistidos no backend.
          </Text>
          <View style={styles.optionStack}>
            {privacyOptions.map((option) => (
              <PrivacyToggle
                key={option.key}
                title={option.title}
                description={option.description}
                enabled={settings[option.key]}
                onPress={() => toggleSetting(option.key)}
              />
            ))}
          </View>
        </OrbitCard>

        <OrbitCard style={styles.section}>
          <Text style={styles.title}>Como o Orbit usa seus dados</Text>
          <Text style={styles.copy}>
            O Orbit usa perfil, preferências, interesses, respostas de compatibilidade e
            incompatibilidades para ordenar recomendações de dating. Temas sensíveis podem afetar o
            score, mas não devem aparecer como motivos explícitos no Feed.
          </Text>
        </OrbitCard>

        <OrbitCard style={styles.section}>
          <Text style={styles.title}>Em breve</Text>
          <FutureRow icon="person-remove-outline" label="Bloquear ou denunciar perfis" />
          <FutureRow icon="download-outline" label="Exportar meus dados" />
          <FutureRow icon="trash-outline" label="Excluir conta e dados" />
        </OrbitCard>
      </View>
    </OrbitScreen>
  );
}

function PrivacyToggle({
  title,
  description,
  enabled,
  onPress,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={onPress}
      style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
    >
      <View style={styles.toggleCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.switchTrack, enabled && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, enabled && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

function FutureRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.futureRow}>
      <Ionicons name={icon} color={theme.colors.textMuted} size={18} />
      <Text style={styles.futureLabel}>{label}</Text>
      <Text style={styles.futureBadge}>futuro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "900",
  },
  copy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  optionStack: {
    gap: theme.spacing.md,
  },
  toggleRow: {
    minHeight: 78,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  toggleCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  optionDescription: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 3,
    justifyContent: "center",
  },
  switchTrackOn: {
    backgroundColor: theme.colors.orbitRedDark,
    borderColor: "rgba(255,255,255,0.18)",
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.textMuted,
  },
  switchThumbOn: {
    backgroundColor: theme.colors.text,
    transform: [{ translateX: 18 }],
  },
  futureRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  futureLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  futureBadge: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
});
