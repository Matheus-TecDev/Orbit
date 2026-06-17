import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { OrbitButton, OrbitHeader, OrbitInput, OrbitScreen } from "../../components/ui";
import { theme } from "../../styles/theme";
import type { PhoneLoginScreenProps } from "../../navigation/types";

export default function PhoneLoginScreen({ navigation }: PhoneLoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <OrbitScreen>
      <OrbitHeader title="Entrar com telefone" onBack={navigation.goBack} />

      <View style={styles.form}>
        <OrbitInput
          label="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="(85) 99999-9999"
        />

        {codeSent ? (
          <>
            <OrbitInput
              label="Código de verificação"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="123456"
            />
            <Text style={styles.status}>
              {verified
                ? "Telefone validado no fluxo mockado. Use e-mail e senha para autenticação real nesta etapa."
                : "Código mockado enviado para este fluxo."}
            </Text>
            {verified ? (
              <OrbitButton
                variant="secondary"
                label="Voltar para login"
                onPress={navigation.goBack}
              />
            ) : (
              <OrbitButton
                label="Validar código"
                disabled={code.length < 4}
                onPress={() => setVerified(true)}
              />
            )}
          </>
        ) : (
          <OrbitButton
            label="Enviar código"
            disabled={phone.trim().length < 8}
            onPress={() => setCodeSent(true)}
          />
        )}
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md,
  },
  status: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
