import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { OrbitButton, OrbitHeader, OrbitInput, OrbitScreen } from "../../components/ui";
import { theme } from "../../styles/theme";
import type { ForgotPasswordScreenProps } from "../../navigation/types";

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <OrbitScreen>
      <OrbitHeader title="Recuperar acesso" onBack={navigation.goBack} />

      <View style={styles.form}>
        <OrbitInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <OrbitButton
          label="Enviar instruções"
          disabled={email.trim().length === 0}
          onPress={() => setSent(true)}
        />
        {sent ? (
          <Text style={styles.status}>Instruções mockadas prontas para este e-mail.</Text>
        ) : null}
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md,
  },
  status: {
    color: theme.colors.success,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
