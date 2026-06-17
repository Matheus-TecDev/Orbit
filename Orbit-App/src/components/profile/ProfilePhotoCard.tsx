import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import type { UserPhotoSlot } from "../../types/profile";

type ProfilePhotoCardProps = {
  slot: UserPhotoSlot;
  onPress: () => void;
};

export default function ProfilePhotoCard({ slot, onPress }: ProfilePhotoCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        slot.filled && styles.filled,
        slot.isPrimary && styles.primary,
        pressed && styles.pressed,
      ]}
    >
      {slot.filled ? (
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(225,6,0,0.20)", "rgba(255,255,255,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <View style={styles.iconWrap}>
        <Ionicons
          name={slot.filled ? "image" : "add"}
          size={24}
          color={theme.colors.text}
        />
      </View>
      <Text style={styles.label}>{slot.label}</Text>
      {slot.isPrimary ? <Text style={styles.badge}>Principal</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31%",
    aspectRatio: 0.72,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    overflow: "hidden",
  },
  filled: {
    backgroundColor: "rgba(225,6,0,0.12)",
  },
  primary: {
    borderColor: "rgba(225,6,0,0.72)",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
    textAlign: "center",
  },
  badge: {
    color: theme.colors.orbitRed,
    fontSize: theme.typography.tiny,
    fontWeight: "900",
  },
});
