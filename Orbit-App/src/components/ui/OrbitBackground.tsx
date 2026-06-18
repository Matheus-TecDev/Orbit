import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { theme } from "../../styles/theme";

export default function OrbitBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.backgroundSoft,
          theme.colors.background,
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.035)", "rgba(255,255,255,0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={styles.fill}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.42)"]}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
