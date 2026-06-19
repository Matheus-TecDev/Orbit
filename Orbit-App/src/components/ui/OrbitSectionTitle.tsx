import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

type OrbitSectionTitleProps = {
  title: string;
  subtitle?: string;
};

export default function OrbitSectionTitle({ title, subtitle }: OrbitSectionTitleProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
    lineHeight: 23,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 19,
  },
});
