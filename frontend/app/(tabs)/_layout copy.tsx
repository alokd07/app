import React, { useRef, useEffect, act } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import SafeBlurView from "../../components/SafeBlurView";
import { BlurView } from "expo-blur";

const P = {
  navy: "#0D1B2A",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  muted: "#8A9BB0",
  cream: "#FAF7F2",
  border: "#E4EAF2",
  white: "#FFFFFF",
  inputBg: "#F0EDE8", // warm grey for inactive bubbles
};

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

// Pill expands to fit icon + label; inactive = circle
const ICON_SIZE = 22;
const CIRCLE_SIZE = 52;
const PILL_H = 52;
const PILL_MAX_W = 130;

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isActive ? 1 : 0,
      tension: 60,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const pillWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_SIZE, PILL_MAX_W],
  });
  const labelOpacity = anim.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });
  const labelWidth = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 70],
  });
  const iconColor = isActive ? P.white : P.muted;

  return (
    <TouchableOpacity
      onPress={() => {
        if (!isActive) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      activeOpacity={0.85}
      style={styles.tabBtn}
    >
      <Animated.View
        style={[
          styles.pill,
          { width: pillWidth, backgroundColor: isActive ? P.navy : P.inputBg },
        ]}
      >
        {/* Icon circle inside pill */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isActive ? P.gold : "transparent" },
          ]}
        >
          <Ionicons
            name={isActive ? tab.icon : tab.iconOutline}
            size={ICON_SIZE}
            color={isActive ? P.navy : P.muted}
          />
        </View>

        {/* Label — only shown when active */}
        <Animated.View style={{ width: labelWidth, overflow: "hidden" }}>
          <Animated.Text
            numberOfLines={1}
            style={[styles.pillLabel, { opacity: labelOpacity }]}
          >
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}
const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = width - 40;
const TAB_WIDTH = TAB_BAR_WIDTH / TABS.length;

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const isActive = state.index;

  // Animation value for the sliding background
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const iconScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: isActive ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <BlurView intensity={80} tint="light" style={styles.blurWrapper}>
        <View style={styles.tabsContainer}>
          {/* ── Sliding Active Indicator ── */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                width: TAB_WIDTH - 12,
                transform: [{ translateX: Animated.add(translateX, 6) }],
              },
            ]}
          >
            <View style={styles.indicatorInner} />
          </Animated.View>

          {/* ── Tab Buttons ── */}
          {TABS.map((tab, index) => {
            const isActive = state.index === index;

            // Icon Scale Animation

            const handlePress = () => {
              if (!isActive) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(tab.name);
              }
            };

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={handlePress}
                activeOpacity={1}
                style={styles.tabBtn}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: iconScale }],
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: isActive ? width * 0.23 : 42,
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 100,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive ? P.white : P.muted + "20",
                    }}
                  >
                    <Ionicons
                      name={(isActive ? tab.icon : tab.iconOutline) as any}
                      size={22}
                      color={isActive ? P.navy : P.muted}
                    />
                  </View>
                  {isActive && (
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isActive ? P.navy : P.muted,
                          fontWeight: isActive ? "800" : "500",
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Outer wrapper — floating above content
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  blurWrapper: {
    width: TAB_BAR_WIDTH,
    height: 68,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  tabBtn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeIndicator: {
    position: "absolute",
    height: 54,
    zIndex: 1,
    justifyContent: "center",
  },
  indicatorInner: {
    flex: 1,
    backgroundColor: P.gold,
    borderRadius: 27,
    // Add a subtle glow to the gold
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    letterSpacing: 0.2,
  },
  barOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // The white rounded pill container
  barInner: {
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: P.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: P.cream,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
    height: 70,
  },

  // The expanding pill
  pill: {
    height: PILL_H,
    borderRadius: PILL_H / 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    overflow: "hidden",
  },

  // Gold circle housing the icon (active) or transparent (inactive)
  iconCircle: {
    width: CIRCLE_SIZE - 8,
    height: CIRCLE_SIZE - 8,
    borderRadius: CIRCLE_SIZE - 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  pillLabel: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: P.white,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
});
