import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import RecommendationReasonList from "../../components/feed/RecommendationReasonList";
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
import { intentModeLabels } from "../../constants/options";
import { useAuth } from "../../contexts/AuthContext";
import type { PublicProfileScreenProps } from "../../navigation/types";
import { likeProfile, passProfile, unmatchMatch } from "../../services/matchService";
import { getPublicProfile } from "../../services/publicProfileService";
import { blockUser, reportUser } from "../../services/safetyService";
import { theme } from "../../styles/theme";
import type { PublicProfileRead } from "../../types/publicProfile";
import { resolveMediaUrl } from "../../utils/mediaUrl";

type PendingAction = "unmatch" | "block" | "report" | null;

export default function PublicProfileScreen({ navigation, route }: PublicProfileScreenProps) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<PublicProfileRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!token) {
        setProfile(null);
        setError("Entre novamente para abrir este perfil.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextProfile = await getPublicProfile(route.params.profileId, token);
        if (isActive) {
          setProfile(nextProfile);
        }
      } catch {
        if (isActive) {
          setProfile(null);
          setError("NÃ£o foi possÃ­vel abrir este perfil.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [route.params.profileId, token]);

  const source = route.params.source;

  return (
    <OrbitScreen>
      <OrbitHeader title="Perfil" subtitle={getSubtitle(source)} onBack={navigation.goBack} />
      {loading ? <SkeletonCard image lines={5} /> : null}
      <OrbitErrorMessage message={error} />
      {feedback ? (
        <OrbitCard style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </OrbitCard>
      ) : null}
      {!loading && !profile ? (
        <OrbitEmptyState
          icon="person-circle-outline"
          title="Perfil indisponÃ­vel"
          description="Este perfil pode ter sido removido, bloqueado ou nÃ£o estar mais autorizado para vocÃª."
        />
      ) : null}
      {profile ? (
        <View style={styles.stack}>
          <Hero profile={profile} />
          <ProfileSection title="Bio">
            {profile.bio ? (
              <Text style={styles.bodyText}>{profile.bio}</Text>
            ) : (
              <Text style={styles.mutedText}>Bio nÃ£o informada.</Text>
            )}
          </ProfileSection>
          <ProfileSection title="Interesses">
            {profile.interests.length > 0 ? (
              <View style={styles.chips}>
                {profile.interests.map((interest) => (
                  <OrbitChip key={interest} label={interest} selected />
                ))}
              </View>
            ) : (
              <Text style={styles.mutedText}>Interesses nÃ£o informados.</Text>
            )}
          </ProfileSection>
          <CompatibilitySection profile={profile} />
          <ActionSection
            source={source}
            chatId={route.params.chatId ?? null}
            matchId={route.params.matchId ?? null}
            loading={actionLoading}
            onLike={() => {
              void executeFeedAction("like");
            }}
            onPass={() => {
              void executeFeedAction("pass");
            }}
            onMessage={() => {
              if (route.params.chatId) {
                navigation.navigate("Chat", {
                  chatId: route.params.chatId,
                  participantName: profile.name,
                  participantUserId: profile.user_id,
                  participantProfileId: profile.profile_id,
                  matchId: route.params.matchId ?? null,
                });
              }
            }}
            onUnmatch={() => setPendingAction("unmatch")}
            onBlock={() => setPendingAction("block")}
            onReport={() => setPendingAction("report")}
          />
        </View>
      ) : null}
      <OrbitConfirmDialog
        visible={pendingAction !== null}
        title={getDialogTitle(pendingAction)}
        message={getDialogMessage(pendingAction, profile?.name ?? "este perfil")}
        confirmLabel={getDialogConfirmLabel(pendingAction)}
        loading={actionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={executePendingAction}
      />
    </OrbitScreen>
  );

  async function executeFeedAction(action: "like" | "pass") {
    if (!token || !profile || actionLoading) {
      setError("Entre novamente para continuar.");
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      if (action === "like") {
        await likeProfile(profile.profile_id, token);
      } else {
        await passProfile(profile.profile_id, token);
      }
      navigation.goBack();
    } catch {
      setError("NÃ£o foi possÃ­vel concluir esta aÃ§Ã£o.");
    } finally {
      setActionLoading(false);
    }
  }

  async function executePendingAction() {
    if (!token || !profile || !pendingAction) {
      setError("Entre novamente para continuar.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setFeedback(null);

    try {
      if (pendingAction === "unmatch") {
        if (!route.params.matchId) {
          setError("Este perfil nÃ£o possui match ativo.");
          return;
        }
        await unmatchMatch(route.params.matchId, token);
        navigation.goBack();
      }
      if (pendingAction === "block") {
        await blockUser(profile.user_id, token);
        navigation.goBack();
      }
      if (pendingAction === "report") {
        await reportUser(
          profile.user_id,
          { reason: "denuncia_usuario", details: `DenÃºncia enviada a partir do perfil ${profile.profile_id}.` },
          token,
        );
        setFeedback("DenÃºncia enviada.");
      }
      setPendingAction(null);
    } catch {
      setError("NÃ£o foi possÃ­vel concluir esta aÃ§Ã£o.");
    } finally {
      setActionLoading(false);
    }
  }
}

function Hero({ profile }: { profile: PublicProfileRead }) {
  const photoUrl = resolveMediaUrl(profile.photo_url);

  return (
    <View style={styles.hero}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroInitial}>{profile.name.charAt(0)}</Text>
        </View>
      )}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.72)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.heroCopy}>
        <Text style={styles.heroName}>
          {profile.name}{profile.age !== null ? `, ${profile.age}` : ""}
        </Text>
        <Text style={styles.heroMeta}>
          {[profile.city, intentModeLabels[profile.intent_mode]].filter(Boolean).join(" Â· ")}
        </Text>
      </View>
    </View>
  );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <OrbitCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </OrbitCard>
  );
}

function CompatibilitySection({ profile }: { profile: PublicProfileRead }) {
  const compatibility = profile.compatibility;
  if (!compatibility) {
    return (
      <ProfileSection title="Compatibilidade">
        <Text style={styles.mutedText}>Compatibilidade nÃ£o disponÃ­vel neste contexto.</Text>
      </ProfileSection>
    );
  }

  const breakdownItems = compatibility.score_breakdown
    ? [
        ["Modo", compatibility.score_breakdown.mode_alignment.score_a_to_b],
        ["PreferÃªncias", compatibility.score_breakdown.objective_preferences.score_a_to_b],
        ["Respostas", compatibility.score_breakdown.compatibility_answers.score_a_to_b],
        ["Prioridades", compatibility.score_breakdown.priorities.score_a_to_b],
      ].filter((item): item is [string, number] => typeof item[1] === "number")
    : [];

  return (
    <ProfileSection title="Compatibilidade">
      <View style={styles.scoreRow}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{compatibility.mutual_score}%</Text>
        </View>
        <View style={styles.scoreCopy}>
          <Text style={styles.bodyText}>Compatibilidade bilateral</Text>
          <Text style={styles.mutedText}>
            {compatibility.coverage_percentage}% de cobertura dos sinais disponÃ­veis
          </Text>
        </View>
      </View>
      {compatibility.common_interests.length > 0 ? (
        <View style={styles.chips}>
          {compatibility.common_interests.map((interest) => (
            <OrbitChip key={interest} label={interest} selected />
          ))}
        </View>
      ) : null}
      {breakdownItems.length > 0 ? (
        <View style={styles.breakdown}>
          {breakdownItems.map(([label, value]) => (
            <View key={label} style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>{label}</Text>
              <Text style={styles.breakdownValue}>{value}%</Text>
            </View>
          ))}
        </View>
      ) : null}
      {compatibility.reason_groups.length > 0 ? (
        <RecommendationReasonList
          reasons={compatibility.reason_groups.flatMap((group) => group.reasons)}
        />
      ) : null}
    </ProfileSection>
  );
}

type ActionSectionProps = {
  source: "feed" | "match" | "chat";
  chatId: string | null;
  matchId: string | null;
  loading: boolean;
  onLike: () => void;
  onPass: () => void;
  onMessage: () => void;
  onUnmatch: () => void;
  onBlock: () => void;
  onReport: () => void;
};

function ActionSection({
  source,
  chatId,
  matchId,
  loading,
  onLike,
  onPass,
  onMessage,
  onUnmatch,
  onBlock,
  onReport,
}: ActionSectionProps) {
  if (source === "feed") {
    return (
      <View style={styles.actionGrid}>
        <OrbitButton variant="secondary" label="Passar" disabled={loading} onPress={onPass} />
        <OrbitButton label="Curtir" disabled={loading} onPress={onLike} />
      </View>
    );
  }

  return (
    <View style={styles.actions}>
      <OrbitButton
        label="Enviar mensagem"
        disabled={loading || !chatId}
        onPress={onMessage}
        icon={<Ionicons name="chatbubble" color={theme.colors.text} size={18} />}
      />
      <View style={styles.actionGrid}>
        <OrbitButton
          compact
          variant="ghost"
          label="Desfazer"
          disabled={loading || !matchId}
          onPress={onUnmatch}
        />
        <OrbitButton compact variant="ghost" label="Denunciar" disabled={loading} onPress={onReport} />
        <OrbitButton compact variant="danger" label="Bloquear" disabled={loading} onPress={onBlock} />
      </View>
    </View>
  );
}

function getSubtitle(source: "feed" | "match" | "chat") {
  if (source === "feed") {
    return "Perfil completo da recomendaÃ§Ã£o";
  }
  if (source === "chat") {
    return "Perfil do participante da conversa";
  }
  return "Perfil do match";
}

function getDialogTitle(action: PendingAction) {
  if (action === "block") {
    return "Bloquear usuÃ¡rio?";
  }
  if (action === "report") {
    return "Denunciar usuÃ¡rio?";
  }
  return "Desfazer match?";
}

function getDialogMessage(action: PendingAction, name: string) {
  if (action === "block") {
    return `${name} nÃ£o aparecerÃ¡ mais em recomendaÃ§Ãµes, matches ou conversas.`;
  }
  if (action === "report") {
    return `A denÃºncia sobre ${name} serÃ¡ registrada para revisÃ£o.`;
  }
  return `VocÃª e ${name} deixarÃ£o de aparecer como match e o chat serÃ¡ encerrado.`;
}

function getDialogConfirmLabel(action: PendingAction) {
  if (action === "block") {
    return "Bloquear";
  }
  if (action === "report") {
    return "Denunciar";
  }
  return "Desfazer";
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
  hero: {
    height: 420,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purpleSoft,
  },
  heroInitial: {
    color: theme.colors.text,
    fontSize: 112,
    fontWeight: "500",
  },
  heroCopy: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  heroName: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "500",
  },
  heroMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "500",
  },
  bodyText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  scoreBadge: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.purple,
  },
  scoreValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "500",
  },
  scoreCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  breakdown: {
    gap: theme.spacing.sm,
  },
  breakdownItem: {
    minHeight: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "400",
  },
  breakdownValue: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.md,
  },
  feedbackCard: {
    borderColor: "rgba(76,217,100,0.28)",
    backgroundColor: "rgba(76,217,100,0.10)",
    marginBottom: theme.spacing.md,
  },
  feedbackText: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "500",
  },
});
