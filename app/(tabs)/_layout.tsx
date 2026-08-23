import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { appColors, fonts } from "../../src/theme/colors";
import { Keyboard } from "react-native";

const P = appColors;
const { width: SW } = Dimensions.get("window");

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  {
    name: "home",
    label: "Home",
    icon: "home" as const,
    iconOut: "home-outline" as const,
  },
  {
    name: "bookings",
    label: "Bookings",
    icon: "calendar" as const,
    iconOut: "calendar-outline" as const,
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person" as const,
    iconOut: "person-outline" as const,
  },
];

// ─── Geometry ──────────────────────────────────────────────────────────────────
const BAR_MX = 20; // horizontal margin from screen edge
const BAR_W = SW - BAR_MX * 2;
const BAR_H = 70;
const TAB_W = BAR_W / TABS.length - 40; // 40 = sum of horizontal margins for each tab
const INDICATOR_W = TAB_W * 0.5;
const INDICATOR_H = 3;

// ─── Single Tab Item ───────────────────────────────────────────────────────────
function TabItem({
  tab,
  isActive,
  progress,
  onPress,
}: {
  tab: (typeof TABS)[0];
  isActive: boolean;
  progress: Animated.Value;
  onPress: () => void;
}) {
  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1.08],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const labelOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });

  const labelTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const pillOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={st.tabItem}>
      {/* Active pill */}
      <Animated.View
        pointerEvents="none"
        style={[
          st.activePill,
          {
            opacity: pillOpacity,
            transform: [{ scale }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(212,165,75,0.22)", "rgba(212,165,75,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Icon */}
      <Animated.View>
        <Ionicons
          name={isActive ? tab.icon : tab.iconOut}
          size={20}
          color={isActive ? P.gold : "rgba(255,255,255,0.45)"}
        />
      </Animated.View>

      {/* Label */}
      <Animated.Text
        style={[
          st.tabLabel,
          {
            opacity: labelOpacity,
            color: isActive ? P.gold : "rgba(255,255,255,0.45)",
          },
        ]}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  // Sliding indicator translateX
  const indicatorX = useRef(
    new Animated.Value(state.index * TAB_W + (TAB_W - INDICATOR_W) / 2),
  ).current;

  // Per-tab progress (0 → inactive, 1 → active)
  const progress = useRef(
    TABS.map((_, i) => new Animated.Value(state.index === i ? 1 : 0)),
  ).current;

  // Bar entrance
  const barY = useRef(new Animated.Value(100)).current;
  const barOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(barY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(barOp, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      // Slide the indicator
      Animated.spring(indicatorX, {
        toValue: state.index * TAB_W + (TAB_W - INDICATOR_W) / 2,
        tension: 90,
        friction: 14,
        useNativeDriver: true,
      }),
      // Animate each tab's progress value
      ...progress.map((p, i) =>
        Animated.timing(p, {
          toValue: state.index === i ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ),
    ]).start();
  }, [state.index]);

  const keyboardHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      style={[st.outerWrap, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      {/* Fog gradient above bar */}
      <LinearGradient
        colors={[
          "rgba(245,246,250,0)",
          "rgba(245,246,250,0.35)",
          "rgba(245,246,250,1)",
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          st.barWrap,
          {
            opacity: Animated.multiply(barOp, keyboardHeight),
            transform: [
              { translateY: barY },
              {
                translateY: keyboardHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Frosted glass / blur layer */}
        {Platform.OS === "ios" ? (
          <BlurView intensity={0} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, st.androidBg]} />
        )}

        {/* Navy gradient layer */}
        <LinearGradient
          colors={["#0D1B2A", "#112236"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: BAR_H / 2 }]}
        />

        {/* Gold top edge line */}
        <LinearGradient
          colors={["transparent", P.gold, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={st.topEdge}
        />

        {/* ── Tab items ── */}
        <View style={st.tabsRow}>
          {TABS.map((tab, idx) => {
            const isActive = state.index === idx;
            return (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={isActive}
                progress={progress[idx]}
                onPress={() => {
                  if (!isActive) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(state.routes[idx].name);
                  }
                }}
              />
            );
          })}
        </View>

        {/* ── Sliding gold underline indicator ── */}
        <Animated.View
          pointerEvents="none"
          style={[st.indicator, { transform: [{ translateX: indicatorX }] }]}
        >
          <LinearGradient
            colors={[P.goldLight, P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Layout export ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          tabBarHideOnKeyboard: true,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen key={tab.name} name={tab.name} />
        ))}
      </Tabs>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 50, // breathing room for fog gradient
  },

  barWrap: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
      },
      android: { elevation: 20 },
    }),
  },

  androidBg: {
    backgroundColor: "#0D1B2A",
  },

  // Gold shimmer line across the top edge of the bar
  topEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    opacity: 0.6,
  },

  tabsRow: {
    flex: 1,
    flexDirection: "row",
  },

  tabItem: {
    width: TAB_W,
    marginHorizontal: 20,
    // height: BAR_H,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 2,
  },

  // Subtle radial glow behind active icon
  iconGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 19,
  },

  tabLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // Gold pill indicator at the bottom of the bar
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    // width: INDICATOR_W,
    // height: INDICATOR_H,
    borderRadius: INDICATOR_H / 2,
    overflow: "hidden",
  },
  activePill: {
    position: "absolute",
    top: 10,
    width: "100%",
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212,165,75,0.18)",
    overflow: "hidden",
  },

  bottomGlow: {
    position: "absolute",
    bottom: 8,
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: P.gold,
    shadowColor: P.gold,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
