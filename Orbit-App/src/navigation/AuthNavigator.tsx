import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import PhoneLoginScreen from "../screens/auth/PhoneLoginScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import LegalTermsScreen from "../screens/settings/LegalTermsScreen";
import PrivacyPolicyScreen from "../screens/settings/PrivacyPolicyScreen";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="LegalTerms" component={LegalTermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
