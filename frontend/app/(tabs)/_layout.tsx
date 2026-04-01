import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const palette = {
  navy: "#0D1B2A",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  muted: "#8A9BB0",
  cream: "#FAF7F2",
};

const TABS = [
  { name: "home", label: "Home", icon: "home", iconOutline: "home-outline" },
  {
    name: "bookings",
    label: "Bookings",
    icon: "calendar",
    iconOutline: "calendar-outline",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person",
    iconOutline: "person-outline",
  },
];

const PILL_MAX_W = 105;
const PILL_MIN_W = 44;

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: any;
  isActive: boolean;
  onPress: () => void;
}) {
  // Single controller for all animations in this button
  const animValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: isActive ? 1 : 0,
      tension: 50, // Increased for snappiness
      friction: 8, // Control overshoot
      useNativeDriver: false, // Required for width interpolation
    }).start();
  }, [isActive]);

  // Interpolations
  const pillWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [PILL_MIN_W, PILL_MAX_W],
  });

  const labelOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const iconScale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1.1],
  });

  const dotScale = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const handlePress = () => {
    if (!isActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.tabBtn}
    >
      <Animated.View style={[styles.pill, { width: pillWidth }]}>
        {/* Background Layer */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: animValue, backgroundColor: palette.gold },
          ]}
        />

        {/* Content Layer */}
        <Animated.View
          style={{
            transform: [{ scale: iconScale }],
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name={(isActive ? tab.icon : tab.iconOutline) as any}
            size={20}
            color={isActive ? palette.navy : palette.muted}
          />
          {isActive && (
            <Animated.Text
              numberOfLines={1}
              style={[styles.pillLabel, { opacity: labelOpacity }]}
            >
              {tab.label}
            </Animated.Text>
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[styles.activeDot, { transform: [{ scale: dotScale }] }]}
      />
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barWrapper, { paddingBottom: insets.bottom || 12 }]}>
      <StatusBar
        backgroundColor={palette.navy}
        barStyle="light-content"
        translucent
      />
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint="extraLight"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
      )}

      <View style={styles.tabsRow}>
        {TABS.map((tab, index) => {
          const isActive = state.index === index;
          return (
            <TabButton
              key={tab.name}
              tab={tab}
              isActive={isActive}
              onPress={() => navigation.navigate(state.routes[index].name)}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  androidBg: {
    backgroundColor: "white",
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 10,
  },
  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    height: 42,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.navy,
    marginLeft: 6,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.gold,
    marginTop: 4,
    position: "absolute",
    bottom: -8,
  },
});
