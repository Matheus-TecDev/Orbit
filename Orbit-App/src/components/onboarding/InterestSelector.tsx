import { StyleSheet, View } from "react-native";

import OrbitChip from "../ui/OrbitChip";
import { theme } from "../../styles/theme";

type InterestSelectorProps = {
  interests: readonly string[];
  selected: string[];
  onToggle: (interest: string) => void;
};

export default function InterestSelector({
  interests,
  selected,
  onToggle,
}: InterestSelectorProps) {
  return (
    <View style={styles.wrap}>
      {interests.map((interest) => (
        <OrbitChip
          key={interest}
          label={interest}
          selected={selected.includes(interest)}
          onPress={() => onToggle(interest)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});
