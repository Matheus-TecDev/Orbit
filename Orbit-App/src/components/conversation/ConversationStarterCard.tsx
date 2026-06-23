import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import type { ConversationStarter } from "../../utils/conversationStarters";
import { OrbitButton, OrbitCard } from "../ui";

type ConversationStarterCardProps = {
  starters: ConversationStarter[];
  title?: string;
  description?: string;
  sending?: boolean;
  embedded?: boolean;
  onSend: (text: string) => void;
};

export default function ConversationStarterCard({
  starters,
  title = "Comece com algo leve",
  description = "Sugestões curtas baseadas no perfil.",
  sending = false,
  embedded = false,
  onSend,
}: ConversationStarterCardProps) {
  const [offset, setOffset] = useState(0);
  const entrance = useRef(new Animated.Value(0)).current;
  const visibleStarters = starters.slice(offset, offset + 3);
  const canRotate = starters.length > 3;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  if (starters.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      <StarterContainer embedded={embedded}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons name="sparkles" color={theme.colors.purpleLight} size={17} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          {canRotate ? (
            <Pressable
              accessibilityRole="button"
              disabled={sending}
              onPress={() => setOffset((current) => (current + 3) % starters.length)}
              style={({ pressed }) => [styles.rotate, pressed && styles.pressed]}
            >
              <Ionicons name="refresh" color={theme.colors.text} size={17} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.list}>
          {visibleStarters.map((starter) => (
            <OrbitButton
              key={starter.id}
              compact
              variant="secondary"
              label={starter.text}
              disabled={sending}
              onPress={() => onSend(starter.text)}
              icon={<Ionicons name="send-outline" color={theme.colors.text} size={15} />}
            />
          ))}
        </View>
      </StarterContainer>
    </Animated.View>
  );
}

function StarterContainer({
  embedded,
  children,
}: {
  embedded: boolean;
  children: ReactNode;
}) {
  if (embedded) {
    return <View style={[styles.card, styles.embeddedCard]}>{children}</View>;
  }

  return <OrbitCard style={styles.card}>{children}</OrbitCard>;
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: "rgba(124,92,252,0.24)",
  },
  embeddedCard: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "400",
  },
  rotate: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  list: {
    gap: theme.spacing.sm,
  },
});
