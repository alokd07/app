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
import { appColors } from "../../src/theme/colors";

const P = appColors;

const TABS = [
  {
    name: "home",
    label: "Home",
    icon: "home" as const,
    iconOutline: "home-outline" as const,
  },
  {
    name: "bookings",
    label: "Bookings",
    icon: "calendar" as const,
    iconOutline: "calendar-outline" as const,
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person" as const,
    iconOutline: "person-outline" as const,
  },
];

// ─── Dimensions ────────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get("window");
const BAR_H = 68;
const BAR_SIDE_PAD = 20;
const BAR_W = SCREEN_W - BAR_SIDE_PAD * 2;
const TAB_W = BAR_W / TABS.length;
const PILL_H = 52;
const PILL_INSET = 6;
const PILL_W = TAB_W - PILL_INSET * 2;
const ICON_BUBBLE = 40;
const LABEL_MAX_W = PILL_W - ICON_BUBBLE - 14;

// ─── Tab Button ────────────────────────────────────────────────────────────────
function TabButton({
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
  const labelOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });
  const labelW = progress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0, LABEL_MAX_W],
  });
  const labelTransX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const iconScale = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0.85, 1.1],
  });
  const activeBubble = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const mutedBubble = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.tabBtn}>
      <View style={styles.tabContent}>
        {/* Icon with stacked bubbles */}
        <Animated.View
          style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}
        >
          <Animated.View
            style={[styles.iconBubbleActive, { opacity: activeBubble }]}
          />
          <Animated.View
            style={[styles.iconBubbleMuted, { opacity: mutedBubble }]}
          />
          <Ionicons
            name={isActive ? tab.icon : tab.iconOutline}
            size={20}
            color={isActive ? P.navy : P.muted}
          />
        </Animated.View>

        {/* Animated label */}
        <Animated.View
          style={[
            styles.labelWrap,
            {
              width: labelW,
              opacity: labelOpacity,
              transform: [{ translateX: labelTransX }],
            },
          ]}
        >
          <Text style={styles.tabLabel} numberOfLines={1}>
            {tab.label}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16);

  const slideX = useRef(new Animated.Value(state.index * TAB_W)).current;
  const tabProgress = useRef(
    TABS.map((_, i) => new Animated.Value(state.index === i ? 1 : 0)),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: state.index * TAB_W,
        tension: 80,
        friction: 13,
        useNativeDriver: true,
      }),
      ...tabProgress.map((p, i) =>
        Animated.timing(p, {
          toValue: state.index === i ? 1 : 0,
          duration: 210,
          useNativeDriver: false,
        }),
      ),
    ]).start();
  }, [state.index]);

  // Pill translateX: offset by PILL_INSET so it's centred inside each tab slot
  const pillTranslateX = Animated.add(slideX, new Animated.Value(PILL_INSET));

  return (
    // pointerEvents="box-none" lets touches pass through the gradient area above the bar
    <View
      style={[styles.outerWrap, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      {/* ── Bottom-up gradient fog ── */}
      <LinearGradient
        colors={[
          "rgba(250,247,242,0.00)",
          "rgba(250,247,242,0.60)",
          "rgba(250,247,242,1.00)",
        ]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Frosted pill bar ── */}
      <View style={styles.barShell} pointerEvents="auto">
        {/* iOS blur */}
        {Platform.OS === "ios" && (
          <BlurView
            intensity={75}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Android solid fallback */}
        {Platform.OS === "android" && (
          <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
        )}

        {/* ── Sliding gold pill ── */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.goldPill,
            { transform: [{ translateX: pillTranslateX }] },
          ]}
        >
          <LinearGradient
            colors={[P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* ── Tabs ── */}
        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            return (
              <TabButton
                key={tab.name}
                tab={tab}
                isActive={isActive}
                progress={tabProgress[index]}
                onPress={() => {
                  if (!isActive) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(state.routes[index].name);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={P.cream} />
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
const styles = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 40, // gradient breathing room above bar
  },

  barShell: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#0D1B2A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 28,
      },
      android: { elevation: 14 },
    }),
  },

  androidBg: {
    // backgroundColor: "rgba(250,247,242,0.97)",
    backgroundColor: "rgba(13,27,42,0.97)",
  },

  goldPill: {
    position: "absolute",
    top: (BAR_H - PILL_H) / 2,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    overflow: "hidden",
  },

  tabsRow: {
    flex: 1,
    flexDirection: "row",
  },

  tabBtn: {
    width: TAB_W,
    height: BAR_H,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: PILL_W,
    height: PILL_H,
    paddingHorizontal: 4,
  },

  iconWrap: {
    width: ICON_BUBBLE,
    height: ICON_BUBBLE,
    borderRadius: ICON_BUBBLE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  iconBubbleActive: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P.white,
    borderRadius: ICON_BUBBLE / 2,
  },

  iconBubbleMuted: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P.mutedBg,
    borderRadius: ICON_BUBBLE / 2,
  },

  labelWrap: {
    overflow: "hidden",
    marginLeft: 4,
  },

  tabLabel: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: 0.1,
  },
});
