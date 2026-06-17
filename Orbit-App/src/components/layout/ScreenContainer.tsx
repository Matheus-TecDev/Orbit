import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

import OrbitScreen from "../ui/OrbitScreen";

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export default function ScreenContainer({
  children,
  scroll,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <OrbitScreen scroll={scroll} contentStyle={contentStyle}>
      {children}
    </OrbitScreen>
  );
}
