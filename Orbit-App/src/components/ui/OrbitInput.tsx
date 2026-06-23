import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { theme } from "../../styles/theme";

type OrbitInputProps = TextInputProps & {
  label: string;
};

export default function OrbitInput({ label, style, ...props }: OrbitInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordInput = props.secureTextEntry === true;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...props}
          secureTextEntry={isPasswordInput && !passwordVisible}
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.purple}
          style={[styles.input, isPasswordInput && styles.passwordInput, style]}
        />
        {isPasswordInput ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            accessibilityState={{ expanded: passwordVisible }}
            hitSlop={8}
            onPress={() => setPasswordVisible((current) => !current)}
            style={({ pressed }) => [styles.eyeButton, pressed && styles.eyePressed]}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={theme.colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    minHeight: 54,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface3,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    paddingHorizontal: theme.spacing.lg,
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: "absolute",
    right: 4,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  eyePressed: {
    opacity: 0.68,
  },
});
