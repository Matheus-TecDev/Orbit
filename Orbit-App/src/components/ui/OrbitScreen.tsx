import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { theme } from "../../styles/theme";
import OrbitBackground from "./OrbitBackground";

type OrbitScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  padded?: boolean;
};

export default function OrbitScreen({
  children,
  scroll = true,
  contentStyle,
  padded = true,
}: OrbitScreenProps) {
  const content = [styles.content, padded && styles.padded, contentStyle];

  return (
    <View style={styles.root}>
      <OrbitBackground />
      <SafeAreaView style={styles.safe}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={content}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={content}>{children}</View>
        )}
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: theme.layout.maxContentWidth,
    alignSelf: "center",
  },
  padded: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
});
