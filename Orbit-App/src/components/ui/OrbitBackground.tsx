import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { theme } from "../../styles/theme";

type Glow = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  color: string;
  opacity: number;
};

const glows: Glow[] = [
  {
    left: "12%",
    top: "10%",
    size: 620,
    color: "rgba(225,6,0,0.16)",
    opacity: 0.88,
  },
  {
    left: "88%",
    top: "36%",
    size: 560,
    color: "rgba(120,0,0,0.18)",
    opacity: 0.72,
  },
  {
    left: "50%",
    top: "92%",
    size: 820,
    color: "rgba(225,6,0,0.08)",
    opacity: 0.68,
  },
];

export default function OrbitBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.black,
          theme.colors.backgroundRed,
          theme.colors.background,
          "#08080B",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.035)", "rgba(255,255,255,0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.65 }}
        style={styles.fill}
      />

      {glows.map((glow) => {
        const dynamicStyle: ViewStyle = {
          left: glow.left,
          top: glow.top,
          width: glow.size,
          height: glow.size,
          marginLeft: -(glow.size / 2),
          marginTop: -(glow.size / 2),
          backgroundColor: glow.color,
          opacity: glow.opacity,
        };

        return <View key={`${glow.left}-${glow.top}`} style={[styles.glow, dynamicStyle]} />;
      })}

      <LinearGradient
        colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.50)", "rgba(0,0,0,0.94)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      />
    </View>
  );
}

const styles = {
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: "absolute" as const,
    borderRadius: theme.radius.round,
  },
};
