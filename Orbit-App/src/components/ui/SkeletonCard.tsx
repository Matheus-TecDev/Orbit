import { StyleSheet, View } from "react-native";

import { theme } from "../../styles/theme";
import OrbitCard from "./OrbitCard";
import OrbitSkeleton from "./OrbitSkeleton";

type SkeletonCardProps = {
  lines?: number;
  image?: boolean;
};

export default function SkeletonCard({ lines = 3, image = false }: SkeletonCardProps) {
  return (
    <OrbitCard style={styles.card}>
      {image ? <OrbitSkeleton height={220} radius={theme.radius.xl} /> : null}
      <View style={styles.lines}>
        {Array.from({ length: lines }).map((_, index) => (
          <OrbitSkeleton
            key={index}
            width={index === lines - 1 ? "62%" : "100%"}
            height={index === 0 ? 22 : 16}
          />
        ))}
      </View>
    </OrbitCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  lines: {
    gap: theme.spacing.md,
  },
});
