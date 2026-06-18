import { Platform } from "react-native";

export const theme = {
  colors: {
    background: "#020203",
    backgroundSoft: "#08090C",
    backgroundElevated: "#101116",
    surface: "#111217",
    surfaceMuted: "#0D0E12",
    surfaceStrong: "#181A21",
    backgroundRed: "#160006",
    orbitRed: "#E23A3A",
    orbitRedDark: "#B91C1C",
    orbitRedDeep: "#650B0B",
    orbitRedSoft: "rgba(226,58,58,0.14)",
    accentPink: "#FF4D88",
    accentPinkSoft: "rgba(255,77,136,0.12)",
    card: "#101116",
    cardStrong: "#171922",
    cardPressed: "#20222C",
    border: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.18)",
    hairline: "rgba(255,255,255,0.07)",
    text: "#F8F5F2",
    textMuted: "rgba(248,245,242,0.72)",
    textSubtle: "rgba(248,245,242,0.52)",
    textFaint: "rgba(248,245,242,0.32)",
    success: "#45D48A",
    warning: "#F2B84B",
    danger: "#FF5C70",
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
    lg: 16,
    xl: 22,
    xxl: 28,
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
        shadowColor: "#E23A3A",
        shadowOpacity: 0.16,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
    soft: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
    elevated: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.28,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
} as const;

export type OrbitTheme = typeof theme;
