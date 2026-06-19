import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../../styles/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type BottomTabIconProps = {
  name: IconName;
  focused: boolean;
  size: number;
};

export default function BottomTabIcon({ name, focused, size }: BottomTabIconProps) {
  return (
    <View style={[styles.wrap, focused && styles.focused]}>
      <Ionicons
        name={name}
        size={size}
        color={focused ? theme.colors.purpleLight : theme.colors.textMutedToken}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  focused: {
    backgroundColor: "rgba(124,92,252,0.12)",
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
  },
});
