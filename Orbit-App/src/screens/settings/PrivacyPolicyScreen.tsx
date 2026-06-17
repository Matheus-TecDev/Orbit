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

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<LegalNavigation>();

  return (
    <OrbitScreen>
      <OrbitHeader title="Política de Privacidade" onBack={navigation.goBack} />
      <View style={styles.content}>
        <Text style={styles.text}>
          Esta Política de Privacidade explica como o Orbit AI coleta, utiliza e
          protege os dados dos usuários.
          {"\n\n"}
          Nesta versão mockada, as informações exibidas ficam apenas em memória e
          em arquivos locais de demonstração.
          {"\n\n"}
          Não há integrações externas nesta demonstração; o conteúdo serve apenas
          para apresentar a experiência visual do produto.
          {"\n\n"}O conteúdo final deverá ser atualizado antes da publicação.
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
