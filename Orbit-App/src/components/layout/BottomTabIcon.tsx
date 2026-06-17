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
        color={focused ? theme.colors.text : theme.colors.textSubtle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 30,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  focused: {
    backgroundColor: theme.colors.orbitRedSoft,
    borderWidth: 1,
    borderColor: "rgba(225,6,0,0.26)",
  },
});
