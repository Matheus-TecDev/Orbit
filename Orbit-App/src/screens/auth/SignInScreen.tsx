import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import {
  OrbitButton,
  OrbitCard,
  OrbitErrorMessage,
  OrbitInput,
  OrbitScreen,
} from "../../components/ui";
import { theme } from "../../styles/theme";
import { useAuth } from "../../contexts/AuthContext";
import type { SignInScreenProps } from "../../navigation/types";

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const { signIn, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function updateEmail(value: string) {
    setEmail(value);
    setLocalMessage(null);
    clearError();
  }

  function updatePassword(value: string) {
    setPassword(value);
    setLocalMessage(null);
    clearError();
  }

  async function handleEmailSignIn() {
    if (!canSubmit) {
      setLocalMessage("Informe e-mail e senha para entrar.");
      return;
    }

    setLocalMessage(null);
    await signIn(email.trim(), password);
  }

  return (
    <OrbitScreen contentStyle={styles.content}>
      <View style={styles.brand}>
        <Image
          source={require("../../assets/Orbit-Transparent.png")}
          resizeMode="contain"
          style={styles.logo}
        />
        <Text style={styles.title}>Orbit AI</Text>
        <Text style={styles.subtitle}>Onde você é o centro</Text>
      </View>

      <OrbitCard style={styles.legalWrap}>
        <Text style={styles.legalText}>
          Ao continuar, você concorda com os{" "}
          <Text
            style={styles.legalLink}
            onPress={() => navigation.navigate("LegalTerms")}
          >
            Termos de Serviço
          </Text>{" "}
          e a{" "}
          <Text
            style={styles.legalLink}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            Política de Privacidade
          </Text>{" "}
          do Orbit AI.
        </Text>
      </OrbitCard>

      <View style={styles.actions}>
        <View style={styles.emailForm}>
          <OrbitInput
            label="E-mail"
            value={email}
            onChangeText={updateEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <OrbitInput
            label="Senha"
            value={password}
            onChangeText={updatePassword}
            secureTextEntry
          />
        </View>
        <OrbitErrorMessage message={localMessage ?? error} />
        <OrbitButton
          label={loading ? "Entrando..." : "Entrar com e-mail"}
          loading={loading}
          disabled={!canSubmit}
          onPress={handleEmailSignIn}
          icon={<Ionicons name="mail" size={18} color={theme.colors.text} />}
        />
      </View>

      <View style={styles.links}>
        <Pressable onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.link}>Criar conta</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.linkMuted}>Dificuldades para acessar?</Text>
        </Pressable>
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "space-between",
    gap: theme.spacing.xl,
  },
  brand: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
  },
  logo: {
    width: 292,
    height: 198,
    marginBottom: -38,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 39,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "800",
    marginTop: theme.spacing.xs,
    textTransform: "uppercase",
  },
  legalWrap: {
    padding: theme.spacing.md,
  },
  legalText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  legalLink: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  actions: {
    gap: theme.spacing.sm,
  },
  emailForm: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  links: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  link: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "900",
  },
  linkMuted: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
