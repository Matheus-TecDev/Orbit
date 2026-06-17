import { StyleSheet, View } from "react-native";

import { theme } from "../../styles/theme";

type OrbitProgressBarProps = {
  value: number;
};

export default function OrbitProgressBar({ value }: OrbitProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: theme.radius.round,
    backgroundColor: "rgba(255,255,255,0.075)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.orbitRed,
  },
});
