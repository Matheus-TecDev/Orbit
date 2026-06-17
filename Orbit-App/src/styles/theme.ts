import { Platform } from "react-native";

export const theme = {
  colors: {
    background: "#030305",
    backgroundSoft: "#0D0D11",
    backgroundElevated: "#15151B",
    backgroundRed: "#160006",
    orbitRed: "#E10600",
    orbitRedDark: "#980400",
    orbitRedDeep: "#5E0000",
    orbitRedSoft: "rgba(225,6,0,0.14)",
    card: "rgba(255,255,255,0.065)",
    cardStrong: "rgba(255,255,255,0.105)",
    cardPressed: "rgba(255,255,255,0.14)",
    border: "rgba(255,255,255,0.105)",
    borderStrong: "rgba(255,255,255,0.20)",
    hairline: "rgba(255,255,255,0.075)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.72)",
    textSubtle: "rgba(255,255,255,0.48)",
    textFaint: "rgba(255,255,255,0.32)",
    success: "#39D98A",
    warning: "#F5B84B",
    danger: "#FF5656",
    black: "#000000",
    white: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 30,
    round: 999,
  },
  typography: {
    hero: 34,
    title: 30,
    heading: 23,
    subheading: 18,
    body: 15,
    small: 13,
    tiny: 11,
  },
  layout: {
    maxContentWidth: 460,
  },
  shadows: {
    glow: Platform.select({
      ios: {
        shadowColor: "#E10600",
        shadowOpacity: 0.32,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: 7,
      },
      default: {},
    }),
    soft: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
    elevated: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.36,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 18 },
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
} as const;

export type OrbitTheme = typeof theme;
