import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import type { ConversationStarter } from "../../utils/conversationStarters";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import ConversationStarterCard from "./ConversationStarterCard";
import { OrbitButton, OrbitCard } from "../ui";

type NewMatchPromptProps = {
  name: string;
  photoUrl: string | null;
  starters: ConversationStarter[];
  sending?: boolean;
  onDismiss: () => void;
  onOpenChat: () => void;
  onSendStarter: (text: string) => void;
};

export default function NewMatchPrompt({
  name,
  photoUrl,
  starters,
  sending = false,
  onDismiss,
  onOpenChat,
  onSendStarter,
}: NewMatchPromptProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const resolvedPhoto = resolveMediaUrl(photoUrl);

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      damping: 18,
      stiffness: 160,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            scale: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.97, 1],
            }),
          },
        ],
      }}
    >
      <OrbitCard elevated style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            {resolvedPhoto ? (
              <Image source={{ uri: resolvedPhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initial}>{name.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.copy}>
            <Text style={styles.kicker}>Novo match</Text>
            <Text style={styles.title}>{name} também curtiu você</Text>
            <Text style={styles.description}>Envie uma primeira mensagem curta agora.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <Ionicons name="close" color={theme.colors.textMuted} size={18} />
          </Pressable>
        </View>
        <ConversationStarterCard
          embedded
          starters={starters}
          title="Escolha uma abertura"
          description="Uma pergunta simples já resolve o silêncio."
          sending={sending}
          onSend={onSendStarter}
        />
        <OrbitButton
          compact
          variant="ghost"
          label="Abrir conversa"
          disabled={sending}
          onPress={onOpenChat}
          icon={<Ionicons name="chatbubble-outline" color={theme.colors.text} size={16} />}
        />
      </OrbitCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    borderColor: "rgba(45,212,191,0.28)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.purpleSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initial: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: "500",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: theme.colors.teal,
    fontSize: theme.typography.tiny,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
});
