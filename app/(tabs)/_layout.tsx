import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
  Keyboard,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { fonts } from "../../src/theme/colors";
import { useChatStore } from "../../src/store/chatStore";
import { useTuitionStore } from "../../src/store/tuitionStore";
import { useUserStore } from "../../src/store/userStore";

const { width: SW } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  ink: "#0D1B2A",
  primary: "#5548E9",
  primaryGradient: ["#6656F8", "#4A3CE5"],
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#E8ECF1",
  muted: "#94A3B8",
  activeText: "#5041E6",
  amber: "#E8A838",
  red: "#EF4444",
};

// ─── 5 Primary Tabs ───────────────────────────────────────────────────────────
const TABS = [
  {
    name: "home",
    label: "Home",
    icon: "home" as const,
    iconOut: "home-outline" as const,
  },
  {
    name: "find-teacher",
    label: "Explore",
    icon: "school" as const,
    iconOut: "school-outline" as const,
  },
  {
    name: "tuition",
    label: "Tuition",
    icon: "layers" as const,
    iconOut: "layers-outline" as const,
    badge: true,
    badgeType: "due" as const,
  },
  {
    name: "messages",
    label: "Messages",
    icon: "chatbubbles" as const,
    iconOut: "chatbubbles-outline" as const,
    badge: true,
    badgeType: "unread" as const,
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person" as const,
    iconOut: "person-outline" as const,
  },
];

const BAR_H = 64;
const DOME_W = 68;
const DOME_H = 24;
const SHOULDER_SIZE = 14;
const CIRCLE_SIZE = 50;

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  const [tabBarWidth, setTabBarWidth] = useState(SW);
  const tabWidth = tabBarWidth / TABS.length;

  const threads = useChatStore((s) => s.threads);
  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const dueCount = useTuitionStore((s) =>
    s.invoices.filter((inv) => inv.status === "DUE").length
  );

  const { activeChildId } = useUserStore();
  const activeTuition = useTuitionStore((s) =>
    s.activeTuitions.find(
      (t) =>
        t.childId === activeChildId &&
        (t.status === "ACTIVE" || t.status === "PAUSED")
    )
  );
  const hasActiveTuition = !!activeTuition;

  const currentRouteName = state.routes[state.index]?.name;
  const activeIdx = currentRouteName === "progress" ? 1 : state.index;

  // Single unified sliding indicator (Dome + Active Floating Circle)
  const indicatorX = useRef(
    new Animated.Value(activeIdx * tabWidth + (tabWidth - DOME_W) / 2)
  ).current;

  // Pop scale bounce for the active floating circle
  const circleScale = useRef(new Animated.Value(1)).current;

  // Tab activation progress values for cross-fading static icons & labels
  const tabProgress = useRef(
    TABS.map((_, i) => new Animated.Value(activeIdx === i ? 1 : 0))
  ).current;

  useEffect(() => {
    const targetIdx =
      state.routes[state.index]?.name === "progress" ? 1 : state.index;

    // Trigger subtle pop on active circle
    circleScale.setValue(0.86);
    Animated.spring(circleScale, {
      toValue: 1,
      damping: 12,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();

    // Slide unified dome + floating circle together
    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: targetIdx * tabWidth + (tabWidth - DOME_W) / 2,
        damping: 18,
        stiffness: 160,
        mass: 0.7,
        useNativeDriver: true,
      }),
      ...tabProgress.map((p, i) =>
        Animated.timing(p, {
          toValue: targetIdx === i ? 1 : 0,
          duration: 180,
          useNativeDriver: false,
        })
      ),
    ]).start();
  }, [state.index, state.routes, tabWidth]);

  // Keyboard hide/show listener
  const keyboardHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Determine active icon for the sliding circle
  const activeTabObj = TABS[activeIdx] || TABS[0];
  const activeIconName =
    activeIdx === 1 && hasActiveTuition ? "bar-chart" : activeTabObj.icon;

  return (
    <View
      style={st.dockedBottomWrapper}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - tabBarWidth) > 1) {
          setTabBarWidth(w);
          const currentIdx =
            state.routes[state.index]?.name === "progress" ? 1 : state.index;
          const currentTabW = w / TABS.length;
          indicatorX.setValue(currentIdx * currentTabW + (currentTabW - DOME_W) / 2);
        }
      }}
    >
      <Animated.View
        style={[
          st.containerWrap,
          {
            paddingBottom: bottomPad,
            opacity: keyboardHeight,
            transform: [
              {
                translateY: keyboardHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [140, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* ── UNIFIED SLIDING DOME & FLOATING ACTIVE CIRCLE ── */}
        <Animated.View
          pointerEvents="none"
          style={[
            st.waveWrap,
            {
              transform: [{ translateX: indicatorX }],
            },
          ]}
        >
          {/* Left Concave Shoulder Transition */}
          <View style={st.leftShoulderWrap}>
            <View style={st.shoulderWhiteBox} />
            <View style={st.leftCutoutCircle} />
          </View>

          {/* Central Convex Dome */}
          <View style={st.domeBody} />

          {/* Right Concave Shoulder Transition */}
          <View style={st.rightShoulderWrap}>
            <View style={st.shoulderWhiteBox} />
            <View style={st.rightCutoutCircle} />
          </View>

          {/* Elevated Floating Active Circle (Lockstep with Dome, Flawlessly Round) */}
          <Animated.View
            style={[
              st.activeFloatingCircleShadow,
              {
                transform: [{ scale: circleScale }],
              },
            ]}
          >
            <View style={st.activeFloatingCircle}>
              <LinearGradient
                colors={C.primaryGradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={st.gradientCircle}
              >
                <Ionicons name={activeIconName} size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── WHITE DOCKED BASE BAR ── */}
        <View style={st.whiteBar}>
          {/* Tabs Row */}
          <View style={st.tabsRow}>
            {TABS.map((tab, idx) => {
              const isTab2 = idx === 1;
              const routeName =
                isTab2 && hasActiveTuition ? "progress" : tab.name;
              const isActive = activeIdx === idx;

              let badgeCount = 0;
              if (tab.name === "messages") badgeCount = totalUnread;
              if (tab.name === "tuition") badgeCount = dueCount;

              const label =
                isTab2 && hasActiveTuition ? "Progress" : tab.label;
              const iconOut =
                isTab2 && hasActiveTuition ? "bar-chart-outline" : tab.iconOut;

              const p = tabProgress[idx];

              // Inactive icon fades out smoothly when active
              const inactiveOpacity = p.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              });

              return (
                <TouchableOpacity
                  key={tab.name}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (!isActive) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate(routeName);
                    }
                  }}
                  style={[st.tabItem, { width: tabWidth }]}
                >
                  {/* Inactive Outline Icon Container */}
                  <Animated.View
                    style={[
                      st.inactiveIconContainer,
                      { opacity: inactiveOpacity },
                    ]}
                  >
                    <Ionicons name={iconOut} size={22} color={C.muted} />
                  </Animated.View>

                  {/* Badge Indicator */}
                  {tab.badge && badgeCount > 0 && (
                    <View
                      style={[
                        st.badgeDot,
                        tab.badgeType === "due" && {
                          backgroundColor: C.amber,
                        },
                      ]}
                    >
                      <Text style={st.badgeText}>{badgeCount}</Text>
                    </View>
                  )}

                  {/* Tab Label */}
                  <Animated.Text
                    style={[
                      st.tabLabel,
                      {
                        color: isActive ? C.activeText : C.muted,
                        fontFamily: isActive ? fonts.bold : fonts.medium,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Animated.Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

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
        <Tabs.Screen name="progress" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const st = StyleSheet.create({
  /* Docked at the bottom, non-floating, non-absolute */
  dockedBottomWrapper: {
    width: "100%",
    backgroundColor: C.surface,
    zIndex: 100,
    overflow: "visible",
  },
  containerWrap: {
    width: "100%",
    backgroundColor: C.surface,
    position: "relative",
    overflow: "visible",
  },

  /* ── Wave / Dome Sliding Notch (Holds the Dome and Active Circle in lockstep) ── */
  waveWrap: {
    position: "absolute",
    top: -DOME_H,
    left: 0,
    width: DOME_W,
    height: DOME_H + 4,
    zIndex: 10,
    alignItems: "center",
  },
  domeBody: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DOME_W,
    height: DOME_H + 6,
    borderTopLeftRadius: DOME_W / 2,
    borderTopRightRadius: DOME_W / 2,
    backgroundColor: C.surface,
  },
  leftShoulderWrap: {
    position: "absolute",
    bottom: 0,
    left: -SHOULDER_SIZE,
    width: SHOULDER_SIZE,
    height: SHOULDER_SIZE,
    overflow: "hidden",
  },
  rightShoulderWrap: {
    position: "absolute",
    bottom: 0,
    right: -SHOULDER_SIZE,
    width: SHOULDER_SIZE,
    height: SHOULDER_SIZE,
    overflow: "hidden",
  },
  shoulderWhiteBox: {
    position: "absolute",
    width: SHOULDER_SIZE,
    height: SHOULDER_SIZE,
    backgroundColor: C.surface,
  },
  leftCutoutCircle: {
    position: "absolute",
    top: -SHOULDER_SIZE,
    left: -SHOULDER_SIZE,
    width: SHOULDER_SIZE * 2,
    height: SHOULDER_SIZE * 2,
    borderRadius: SHOULDER_SIZE,
    backgroundColor: C.bg,
  },
  rightCutoutCircle: {
    position: "absolute",
    top: -SHOULDER_SIZE,
    right: -SHOULDER_SIZE,
    width: SHOULDER_SIZE * 2,
    height: SHOULDER_SIZE * 2,
    borderRadius: SHOULDER_SIZE,
    backgroundColor: C.bg,
  },

  /* Active Floating Circle Button Shadow Wrapper */
  activeFloatingCircleShadow: {
    position: "absolute",
    top: 6,
    left: (DOME_W - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    zIndex: 15,
    ...Platform.select({
      ios: {
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: { elevation: 9 },
    }),
  },
  activeFloatingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: "hidden",
  },
  gradientCircle: {
    width: "100%",
    height: "100%",
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* ── White Docked Base Bar ── */
  whiteBar: {
    width: "100%",
    height: BAR_H,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 236, 241, 0.7)",
    overflow: "visible",
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#0D1B2A",
    //     shadowOffset: { width: 0, height: -4 },
    //     shadowOpacity: 0.05,
    //     shadowRadius: 10,
    //   },
    //   android: { elevation: 6 },
    // }),
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
  },
  tabItem: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  inactiveIconContainer: {
    position: "absolute",
    top: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },

  tabLabel: {
    position: "absolute",
    bottom: 8,
    fontSize: 11,
    letterSpacing: -0.2,
    textAlign: "center",
  },

  /* Badge indicator */
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 14,
    backgroundColor: C.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: C.surface,
    zIndex: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: fonts.bold,
  },
});
