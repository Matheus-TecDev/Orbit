import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { ReactNode } from "react";

import { theme } from "../../styles/theme";
import type { FeedAction } from "./SwipeActionButtons";

const screenWidth = Dimensions.get("window").width;
const swipeThreshold = Math.min(140, screenWidth * 0.28);
const exitDistance = screenWidth * 1.25;

type SwipeableRecommendationCardProps = {
  children: ReactNode;
  disabled: boolean;
  onSwipe: (action: FeedAction) => Promise<boolean>;
};

export default function SwipeableRecommendationCard({
  children,
  disabled,
  onSwipe,
}: SwipeableRecommendationCardProps) {
  const translateX = useSharedValue(0);
  const interactionLocked = useSharedValue(false);

  async function executeSwipe(action: FeedAction) {
    const succeeded = await onSwipe(action);
    if (!succeeded) {
      translateX.value = withSpring(0, springConfig);
      interactionLocked.value = false;
    }
  }

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-22, 22])
    .failOffsetY([-14, 14])
    .onUpdate((event) => {
      if (!interactionLocked.value) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (interactionLocked.value) {
        return;
      }

      if (translateX.value >= swipeThreshold) {
        interactionLocked.value = true;
        translateX.value = withTiming(exitDistance, exitAnimation);
        runOnJS(executeSwipe)("like");
        return;
      }

      if (translateX.value <= -swipeThreshold) {
        interactionLocked.value = true;
        translateX.value = withTiming(-exitDistance, exitAnimation);
        runOnJS(executeSwipe)("pass");
        return;
      }

      translateX.value = withSpring(0, springConfig);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-8, 0, 8],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }],
    };
  });

  const likeFeedbackStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, swipeThreshold * 0.45, swipeThreshold],
      [0, 0.45, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, swipeThreshold],
          [0.92, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const passFeedbackStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-swipeThreshold, -swipeThreshold * 0.45, 0],
      [1, 0.45, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-swipeThreshold, 0],
          [1, 0.92],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.wrap, cardStyle]}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[styles.feedback, styles.likeFeedback, likeFeedbackStyle]}
        >
          <Text style={[styles.feedbackText, styles.likeText]}>QUERO CONHECER</Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.feedback, styles.passFeedback, passFeedbackStyle]}
        >
          <Text style={[styles.feedbackText, styles.passText]}>NÃO É PARA MIM</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const springConfig = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
} as const;

const exitAnimation = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
} as const;

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  feedback: {
    position: "absolute",
    top: theme.spacing.xl,
    zIndex: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: "rgba(12,12,18,0.88)",
  },
  likeFeedback: {
    left: theme.spacing.lg,
    borderColor: "rgba(196,181,253,0.62)",
  },
  passFeedback: {
    right: theme.spacing.lg,
    borderColor: "rgba(255,255,255,0.28)",
  },
  feedbackText: {
    fontSize: theme.typography.small,
    fontWeight: "700",
    letterSpacing: 0,
  },
  likeText: {
    color: theme.colors.purpleLight,
  },
  passText: {
    color: theme.colors.textSecondary,
  },
});
