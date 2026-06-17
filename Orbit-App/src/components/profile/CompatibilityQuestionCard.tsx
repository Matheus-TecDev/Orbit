import { StyleSheet, Text, View } from "react-native";

import OrbitChip from "../ui/OrbitChip";
import OrbitCard from "../ui/OrbitCard";
import { theme } from "../../styles/theme";
import type { CompatibilityQuestion } from "../../types/compatibility";

type CompatibilityQuestionCardProps = {
  question: CompatibilityQuestion;
  value: number;
  onChange: (value: number) => void;
};

const scale = [1, 2, 3, 4, 5] as const;

export default function CompatibilityQuestionCard({
  question,
  value,
  onChange,
}: CompatibilityQuestionCardProps) {
  return (
    <OrbitCard style={styles.card}>
      <Text style={styles.question}>{question.text}</Text>
      <View style={styles.scale}>
        {scale.map((item) => (
          <OrbitChip
            key={item}
            label={String(item)}
            selected={value === item}
            onPress={() => onChange(item)}
          />
        ))}
      </View>
    </OrbitCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  question: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
    lineHeight: 21,
  },
  scale: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
});
