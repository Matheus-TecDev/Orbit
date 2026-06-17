import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

import { OrbitHeader, OrbitScreen } from "../../components/ui";
import { theme } from "../../styles/theme";
import type {
  AppStackParamList,
  AuthStackParamList,
  OnboardingStackParamList,
} from "../../navigation/types";

type LegalNavigation = NavigationProp<
  AuthStackParamList & OnboardingStackParamList & AppStackParamList
>;

export default function LegalTermsScreen() {
  const navigation = useNavigation<LegalNavigation>();

  return (
    <OrbitScreen>
      <OrbitHeader title="Termos de Serviço" onBack={navigation.goBack} />
      <View style={styles.content}>
        <Text style={styles.text}>
          Estes Termos de Serviço regulam o uso do aplicativo Orbit AI.
          {"\n\n"}
          Ao utilizar o aplicativo, você concorda com as regras, direitos e
          responsabilidades aqui descritos.
          {"\n\n"}
          Esta versão usa dados mockados locais para demonstrar autenticação,
          onboarding, feed, matches e conversas.
          {"\n\n"}O conteúdo jurídico final deverá ser revisado antes da publicação.
        </Text>
      </View>
    </OrbitScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
});
