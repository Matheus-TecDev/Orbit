import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import {
  OrbitButton,
  OrbitCard,
  OrbitChip,
  OrbitConfirmDialog,
  OrbitEmptyState,
  OrbitErrorMessage,
  OrbitHeader,
  OrbitScreen,
  SkeletonCard,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { MatchesScreenProps } from "../../navigation/types";
import { getMatchList, unmatchMatch } from "../../services/matchService";
import { blockUser, reportUser } from "../../services/safetyService";
import { theme } from "../../styles/theme";
import type { MatchListItem } from "../../types/match";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingSafetyAction | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMatches() {
      if (!token) {
        setMatches([]);
        setMatchesError("Entre novamente para atualizar seus matches.");
        return;
      }

      setLoading(true);
      setMatchesError(null);

      try {
        const nextMatches = await getMatchList(token);

        if (!isActive) {
          return;
        }

        setMatches(nextMatches);
      } catch {
        if (!isActive) {
          return;
        }

        setMatches([]);
        setMatchesError("Não foi possível carregar seus matches. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadMatches();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <OrbitScreen>
      <OrbitHeader title="Matches" subtitle="Pessoas que também curtiram você" />

      <View style={styles.stack}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : null}
        <OrbitErrorMessage message={matchesError} />
        <OrbitErrorMessage message={chatError} />
        {feedback ? (
          <OrbitCard style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </OrbitCard>
        ) : null}
        {!loading && matches.length === 0 ? (
          <OrbitEmptyState
            icon={matchesError ? "cloud-offline-outline" : "heart-outline"}
            title="Sem matches ainda"
            description="Curta perfis no Feed. Quando houver interesse mútuo, o match aparecerá aqui."
            actionLabel="Ir para o Feed"
            onAction={() => navigation.navigate("Feed")}
          />
        ) : null}
        {!loading
          ? matches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                elevated={index === 0}
                actionLoading={actionLoading}
                onOpenChat={() => {
                  if (match.chatId) {
                    setChatError(null);
                    navigation.navigate("Chat", {
                      chatId: match.chatId,
                      participantName: match.name,
                      participantUserId: match.userId,
                      participantProfileId: match.profileId,
                      matchId: match.id,
                    });
                    return;
                  }

                  setChatError("Este match ainda não tem conversa disponível.");
                }}
                onOpenProfile={() =>
                  navigation.navigate("PublicProfile", {
                    profileId: match.profileId,
                    source: "match",
                    matchId: match.id,
                    chatId: match.chatId,
                  })
                }
                onUnmatch={() => setPendingAction({ type: "unmatch", match })}
                onReport={() => setPendingAction({ type: "report", match })}
                onBlock={() => setPendingAction({ type: "block", match })}
              />
            ))
          : null}
      </View>
      <OrbitConfirmDialog
        visible={pendingAction !== null}
        title={getDialogTitle(pendingAction)}
        message={getDialogMessage(pendingAction)}
        confirmLabel={getDialogConfirmLabel(pendingAction)}
        loading={actionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={executePendingAction}
      />
    </OrbitScreen>
  );

  async function executePendingAction() {
    if (!token || !pendingAction) {
      setMatchesError("Entre novamente para continuar.");
      return;
    }

    setActionLoading(true);
    setMatchesError(null);
    setChatError(null);
    setFeedback(null);

    try {
      if (pendingAction.type === "unmatch") {
        await unmatchMatch(pendingAction.match.id, token);
        setMatches((current) => current.filter((item) => item.id !== pendingAction.match.id));
        setFeedback("Match desfeito.");
      }
      if (pendingAction.type === "block") {
        await blockUser(pendingAction.match.userId, token);
        setMatches((current) => current.filter((item) => item.id !== pendingAction.match.id));
        setFeedback("Usuário bloqueado.");
      }
      if (pendingAction.type === "report") {
        await reportUser(
          pendingAction.match.userId,
          { reason: "denuncia_usuario", details: `Denúncia enviada a partir do match ${pendingAction.match.id}.` },
          token,
        );
        setFeedback("Denúncia enviada.");
      }
      setPendingAction(null);
    } catch {
      setMatchesError("Não foi possível concluir esta ação.");
    } finally {
      setActionLoading(false);
    }
  }
}

type MatchCardProps = {
  match: MatchListItem;
  elevated: boolean;
  actionLoading: boolean;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onUnmatch: () => void;
  onReport: () => void;
  onBlock: () => void;
};

function MatchCard({
  match,
  elevated,
  actionLoading,
  onOpenChat,
  onOpenProfile,
  onUnmatch,
  onReport,
  onBlock,
}: MatchCardProps) {
  const photoUrl = resolveMediaUrl(match.photoUrl);

  return (
    <OrbitCard elevated={elevated} style={styles.matchCard}>
      <View style={styles.matchMain}>
        <View style={[styles.avatar, { backgroundColor: match.photoColor }]}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.initial}>{match.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {match.name}
          </Text>
          <Text style={styles.meta}>{buildMatchMeta(match)}</Text>
          {match.shortBio ? (
            <Text numberOfLines={2} style={styles.bio}>
              {match.shortBio}
            </Text>
          ) : null}
          {match.interests.length > 0 ? (
            <View style={styles.chips}>
              {match.interests.slice(0, 3).map((interest) => (
                <OrbitChip key={interest} label={interest} selected />
              ))}
            </View>
          ) : null}
        </View>
        <OrbitButton
          compact
          variant="secondary"
          label="Conversa"
          onPress={onOpenChat}
          icon={<Ionicons name="chatbubble" color={theme.colors.text} size={16} />}
        />
      </View>
      <View style={styles.safetyActions}>
        <OrbitButton
          compact
          variant="secondary"
          label="Perfil"
          disabled={actionLoading}
          onPress={onOpenProfile}
        />
        <OrbitButton
          compact
          variant="ghost"
          label="Desfazer"
          disabled={actionLoading}
          onPress={onUnmatch}
        />
        <OrbitButton
          compact
          variant="ghost"
          label="Denunciar"
          disabled={actionLoading}
          onPress={onReport}
        />
        <OrbitButton
          compact
          variant="danger"
          label="Bloquear"
          disabled={actionLoading}
          onPress={onBlock}
        />
      </View>
    </OrbitCard>
  );
}

type PendingSafetyAction = {
  type: "unmatch" | "block" | "report";
  match: MatchListItem;
};

function getDialogTitle(action: PendingSafetyAction | null) {
  if (action?.type === "block") {
    return "Bloquear usuário?";
  }
  if (action?.type === "report") {
    return "Denunciar usuário?";
  }
  return "Desfazer match?";
}

function getDialogMessage(action: PendingSafetyAction | null) {
  if (!action) {
    return "";
  }
  if (action.type === "block") {
    return `${action.match.name} não aparecerá mais em recomendações, matches ou conversas.`;
  }
  if (action.type === "report") {
    return `A denúncia sobre ${action.match.name} será registrada para revisão.`;
  }
  return `Você e ${action.match.name} deixarão de aparecer como match e o chat será encerrado.`;
}

function getDialogConfirmLabel(action: PendingSafetyAction | null) {
  if (action?.type === "block") {
    return "Bloquear";
  }
  if (action?.type === "report") {
    return "Denunciar";
  }
  return "Desfazer";
}

function buildMatchMeta(match: MatchListItem) {
  const pieces = [
    match.age ? `${match.age} anos` : null,
    match.city,
  ].filter(Boolean);

  return pieces.length > 0 ? pieces.join(" · ") : "Perfil real";
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  matchCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  matchMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
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
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  bio: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  safetyActions: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  feedbackCard: {
    borderColor: "rgba(76,217,100,0.28)",
    backgroundColor: "rgba(76,217,100,0.10)",
  },
  feedbackText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
});
