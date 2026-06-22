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

const P = appColors;
const { width: SW } = Dimensions.get("window");

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { name: "home",     label: "Home",     icon: "home"     as const, iconOut: "home-outline"     as const },
  { name: "bookings", label: "Bookings", icon: "calendar" as const, iconOut: "calendar-outline" as const },
  { name: "profile",  label: "Profile",  icon: "person"   as const, iconOut: "person-outline"   as const },
];

// ─── Geometry ──────────────────────────────────────────────────────────────────
const BAR_MX    = 20;              // horizontal margin from screen edge
const BAR_W     = SW - BAR_MX * 2;
const BAR_H     = 70;
const TAB_W     = BAR_W / TABS.length;
const INDICATOR_W = 28;
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
  // Icon bounce on activate
  const iconScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1.15],
  });
  const iconTransY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  // Label fade + slide
  const labelOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const labelScale   = progress.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

  // Icon color blending (gold when active, muted when not)
  const iconColor = isActive ? P.gold : "rgba(255,255,255,0.4)";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={st.tabItem}
    >
      {/* Icon */}
      <Animated.View
        style={[
          st.iconWrap,
          { transform: [{ scale: iconScale }, { translateY: iconTransY }] },
        ]}
      >
        {/* Active glow behind icon */}
        {isActive && (
          <Animated.View style={[st.iconGlow, { opacity: progress }]} />
        )}
        <Ionicons
          name={isActive ? tab.icon : tab.iconOut}
          size={18}
          color={iconColor}
        />
      </Animated.View>

      {/* Label */}
      <Animated.Text
        style={[
          st.tabLabel,
          {
            opacity: labelOpacity,
            transform: [{ scale: labelScale }],
            color: isActive ? P.gold : "rgba(255,255,255,0.38)",
          },
        ]}
        numberOfLines={1}
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
    new Animated.Value(state.index * TAB_W + (TAB_W - INDICATOR_W) / 2)
  ).current;

  // Per-tab progress (0 → inactive, 1 → active)
  const progress = useRef(
    TABS.map((_, i) => new Animated.Value(state.index === i ? 1 : 0))
  ).current;

  // Bar entrance
  const barY   = useRef(new Animated.Value(100)).current;
  const barOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(barY,  { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(barOp, { toValue: 1, duration: 380,              useNativeDriver: true }),
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
        })
      ),
    ]).start();
  }, [state.index]);

  return (
    <View
      style={[st.outerWrap, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      {/* Fog gradient above bar */}
      <LinearGradient
        colors={["rgba(245,246,250,0)", "rgba(245,246,250,0.35)", "rgba(245,246,250,1)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View
        style={[st.barWrap, { transform: [{ translateY: barY }], opacity: barOp }]}
        pointerEvents="auto"
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
        screenOptions={{ headerShown: false, animation: "fade" }}
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
    bottom: 0, left: 0, right: 0,
    alignItems: "center",
    paddingTop: 50,        // breathing room for fog gradient
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
    top: 0, left: 0, right: 0,
    height: 1.5,
    opacity: 0.6,
  },

  tabsRow: {
    flex: 1,
    flexDirection: "row",
    marginTop: 2
  },

  tabItem: {
    width: TAB_W,
    height: BAR_H,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 2,
    zIndex: 2,
  },

  iconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  // Subtle radial glow behind active icon
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
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
    width: INDICATOR_W,
    height: INDICATOR_H,
    borderRadius: INDICATOR_H / 2,
    overflow: "hidden",
  },
});
