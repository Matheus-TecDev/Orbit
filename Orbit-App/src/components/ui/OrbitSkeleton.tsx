import { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

import { theme } from "../../styles/theme";

type OrbitSkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export default function OrbitSkeleton({
  width = "100%",
  height = 18,
  radius = theme.radius.md,
  style,
}: OrbitSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 780,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 780,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
});
