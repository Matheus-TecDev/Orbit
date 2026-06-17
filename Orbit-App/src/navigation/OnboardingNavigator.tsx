import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingProvider } from "../contexts/OnboardingContext";
import BasicInfoScreen from "../screens/onboarding/BasicInfoScreen";
import CompatibilityDealbreakersScreen from "../screens/onboarding/CompatibilityDealbreakersScreen";
import CompatibilityPrioritiesScreen from "../screens/onboarding/CompatibilityPrioritiesScreen";
import CompatibilityQuestionsScreen from "../screens/onboarding/CompatibilityQuestionsScreen";
import IntentSelectionScreen from "../screens/onboarding/IntentSelectionScreen";
import InterestsScreen from "../screens/onboarding/InterestsScreen";
import PhotoUploadScreen from "../screens/onboarding/PhotoUploadScreen";
import PreferencesScreen from "../screens/onboarding/PreferencesScreen";
import TermsConsentScreen from "../screens/onboarding/TermsConsentScreen";
import LegalTermsScreen from "../screens/settings/LegalTermsScreen";
import PrivacyPolicyScreen from "../screens/settings/PrivacyPolicyScreen";
import type { OnboardingStackParamList } from "./types";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TermsConsent" component={TermsConsentScreen} />
        <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="IntentSelection" component={IntentSelectionScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen
          name="CompatibilityPriorities"
          component={CompatibilityPrioritiesScreen}
        />
        <Stack.Screen
          name="CompatibilityQuestions"
          component={CompatibilityQuestionsScreen}
        />
        <Stack.Screen
          name="CompatibilityDealbreakers"
          component={CompatibilityDealbreakersScreen}
        />
        <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
        <Stack.Screen name="LegalTerms" component={LegalTermsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
