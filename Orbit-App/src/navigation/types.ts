import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  PhoneLogin: undefined;
  ForgotPassword: undefined;
  LegalTerms: undefined;
  PrivacyPolicy: undefined;
};

export type OnboardingStackParamList = {
  TermsConsent: undefined;
  BasicInfo: undefined;
  IntentSelection: undefined;
  Preferences: undefined;
  Interests: undefined;
  CompatibilityQuestions: undefined;
  PhotoUpload: undefined;
  LegalTerms: undefined;
  PrivacyPolicy: undefined;
};

export type AppTabParamList = {
  Feed: undefined;
  Explore: undefined;
  Matches: undefined;
  ChatList: undefined;
  MyProfile: undefined;
};

export type AppStackParamList = {
  AppTabs: NavigatorScreenParams<AppTabParamList> | undefined;
  Chat: { chatId: string };
  LegalTerms: undefined;
  PrivacyPolicy: undefined;
};

export type SignInScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "SignIn"
>;
export type SignUpScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "SignUp"
>;
export type PhoneLoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "PhoneLogin"
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "ForgotPassword"
>;

export type TermsConsentScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "TermsConsent"
>;
export type BasicInfoScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "BasicInfo"
>;
export type IntentSelectionScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "IntentSelection"
>;
export type PreferencesScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Preferences"
>;
export type InterestsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Interests"
>;
export type CompatibilityQuestionsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "CompatibilityQuestions"
>;
export type PhotoUploadScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "PhotoUpload"
>;

export type FeedScreenProps = BottomTabScreenProps<AppTabParamList, "Feed">;
export type ExploreScreenProps = BottomTabScreenProps<AppTabParamList, "Explore">;
export type MatchesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Matches">,
  NativeStackScreenProps<AppStackParamList>
>;
export type ChatListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "ChatList">,
  NativeStackScreenProps<AppStackParamList>
>;
export type MyProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "MyProfile">,
  NativeStackScreenProps<AppStackParamList>
>;
export type ChatScreenProps = NativeStackScreenProps<AppStackParamList, "Chat">;
export type AppLegalScreenProps =
  | NativeStackScreenProps<AppStackParamList, "LegalTerms">
  | NativeStackScreenProps<AppStackParamList, "PrivacyPolicy">;
