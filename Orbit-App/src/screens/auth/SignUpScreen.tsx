import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import {
  OrbitButton,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitInput,
  OrbitScreen,
} from "../../components/ui";
import { theme } from "../../styles/theme";
import { useAuth } from "../../contexts/AuthContext";
import type { SignUpScreenProps } from "../../navigation/types";

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit =
    accepted &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    birthDate.trim().length > 0;

  function clearMessages() {
    setLocalError(null);
    clearError();
  }

  async function handleSignUp() {
    if (password !== confirmPassword) {
      setLocalError("As senhas precisam ser iguais.");
      return;
    }

    if (password.length < 8) {
      setLocalError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLocalError(null);
    await signUp({
      email: email.trim(),
      password,
      full_name: name.trim(),
    });
  }

  return (
    <OrbitScreen>
      <OrbitHeader title="Criar conta" onBack={navigation.goBack} />

      <View style={styles.form}>
        <OrbitInput label="Nome" value={name} onChangeText={(value) => {
          setName(value);
          clearMessages();
        }} />
        <OrbitInput
          label="E-mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearMessages();
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <OrbitInput
          label="Senha"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearMessages();
          }}
          secureTextEntry
        />
        <OrbitInput
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearMessages();
          }}
          secureTextEntry
        />
        <OrbitInput
          label="Data de nascimento"
          value={birthDate}
          onChangeText={(value) => {
            setBirthDate(value);
            clearMessages();
          }}
          placeholder="DD/MM/AAAA"
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => {
            setAccepted((current) => !current);
            clearMessages();
          }}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted ? (
              <Ionicons name="checkmark" color={theme.colors.text} size={16} />
            ) : null}
          </View>
          <Text style={styles.checkText}>Aceito os termos e a política de privacidade.</Text>
        </Pressable>

        <OrbitErrorMessage message={localError ?? error} />

        <OrbitButton
          label={loading ? "Criando conta..." : "Criar conta"}
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSignUp}
        />
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
  },
  checkText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
