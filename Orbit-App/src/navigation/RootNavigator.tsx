import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { OrbitCard, OrbitScreen } from "../components/ui";
import ChatScreen from "../screens/app/ChatScreen";
import PublicProfileScreen from "../screens/app/PublicProfileScreen";
import ProfileCompatibilityScreen from "../screens/profile/ProfileCompatibilityScreen";
import ProfileIntentScreen from "../screens/profile/ProfileIntentScreen";
import ProfileInterestsScreen from "../screens/profile/ProfileInterestsScreen";
import ProfilePersonalDataScreen from "../screens/profile/ProfilePersonalDataScreen";
import ProfilePreferencesScreen from "../screens/profile/ProfilePreferencesScreen";
import ProfilePrivacySecurityScreen from "../screens/profile/ProfilePrivacySecurityScreen";
import CompatibilitySettingsScreen from "../screens/settings/CompatibilitySettingsScreen";
import LegalTermsScreen from "../screens/settings/LegalTermsScreen";
import PrivacyPolicyScreen from "../screens/settings/PrivacyPolicyScreen";
import { theme } from "../styles/theme";
import AppTabsNavigator from "./AppTabsNavigator";
import AuthNavigator from "./AuthNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import type { AppStackParamList } from "./types";

const AppStack = createNativeStackNavigator<AppStackParamList>();

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.purple,
  },
};

function AppStackNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="AppTabs" component={AppTabsNavigator} />
      <AppStack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
      <AppStack.Screen name="ProfilePersonalData" component={ProfilePersonalDataScreen} />
      <AppStack.Screen name="ProfileIntent" component={ProfileIntentScreen} />
      <AppStack.Screen name="ProfileInterests" component={ProfileInterestsScreen} />
      <AppStack.Screen name="ProfileCompatibility" component={ProfileCompatibilityScreen} />
      <AppStack.Screen name="ProfilePreferences" component={ProfilePreferencesScreen} />
      <AppStack.Screen name="ProfilePrivacySecurity" component={ProfilePrivacySecurityScreen} />
      <AppStack.Screen name="CompatibilitySettings" component={CompatibilitySettingsScreen} />
      <AppStack.Screen name="LegalTerms" component={LegalTermsScreen} />
      <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </AppStack.Navigator>
  );
}

function NavigationTree() {
  const { isBootstrapping, status } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      {isBootstrapping ? <BootstrapLoading /> : null}
      {!isBootstrapping && status === "signedOut" ? <AuthNavigator /> : null}
      {!isBootstrapping && status === "onboarding" ? <OnboardingNavigator /> : null}
      {!isBootstrapping && status === "signedIn" ? <AppStackNavigator /> : null}
    </NavigationContainer>
  );
}

function BootstrapLoading() {
  return (
    <OrbitScreen scroll={false}>
      <View style={styles.loadingWrap}>
        <OrbitCard elevated style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.purple} size="small" />
          <Text style={styles.loadingText}>Restaurando sessão...</Text>
        </OrbitCard>
      </View>
    </OrbitScreen>
  );
}

export default function RootNavigator() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <NavigationTree />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    minWidth: 220,
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "400",
  },
});
