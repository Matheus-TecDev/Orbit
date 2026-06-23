import { Modal, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";
import OrbitButton from "./OrbitButton";
import OrbitCard from "./OrbitCard";

type OrbitConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function OrbitConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  loading = false,
  onCancel,
  onConfirm,
}: OrbitConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <OrbitCard elevated style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <OrbitButton
              compact
              variant="secondary"
              label="Cancelar"
              disabled={loading}
              onPress={onCancel}
            />
            <OrbitButton
              compact
              variant="danger"
              label={confirmLabel}
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </OrbitCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.68)",
    padding: theme.spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "600",
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
