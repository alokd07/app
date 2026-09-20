import React from "react";
import { View, Platform, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

type BlurTint =
  | "light"
  | "dark"
  | "default"
  | "extraLight"
  | "regular"
  | "prominent"
  | "systemUltraThinMaterial"
  | "systemThinMaterial"
  | "systemMaterial"
  | "systemThickMaterial"
  | "systemChromeMaterial";

type SafeBlurViewProps = {
  intensity?: number;
  tint?: BlurTint;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  fallbackColor?: string;
};

export default function SafeBlurView({
  intensity = 30,
  tint = "default",
  style,
  children,
  fallbackColor = "rgba(2, 8, 23, 0.72)",
}: SafeBlurViewProps) {
  if (Platform.OS === "web") {
    return (
      <View style={[style, { backgroundColor: fallbackColor }]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={style}>
      {children}
    </BlurView>
  );
}
