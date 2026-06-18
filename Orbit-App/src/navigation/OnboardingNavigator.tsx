import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingProvider } from "../contexts/OnboardingContext";
import BasicInfoScreen from "../screens/onboarding/BasicInfoScreen";
import IntentSelectionScreen from "../screens/onboarding/IntentSelectionScreen";
import InterestsScreen from "../screens/onboarding/InterestsScreen";
import PhotoUploadScreen from "../screens/onboarding/PhotoUploadScreen";
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
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
        <Stack.Screen name="LegalTerms" component={LegalTermsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
