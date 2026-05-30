import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import Avatar from "./Avatar";
import { appColors, fonts } from "../src/theme/colors";

function routeNameToTitle(routeName: string) {
  return routeName
    .replace(/\[(.*?)\]/g, "$1")
    .replace(/[-_/]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function CentralizedHeader({
  navigation,
  route,
  options,
  back,
}: any) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user) as any;

  const title =
    typeof options.headerTitle === "string"
      ? options.headerTitle
      : typeof options.title === "string"
        ? options.title
        : routeNameToTitle(route.name);

  const handleAvatarPress = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Left — back / home */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={() =>
          back
            ? navigation.goBack()
            : navigation.navigate("(tabs)" as never)
        }
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={back ? "arrow-back" : "home-outline"}
          size={20}
          color={appColors.ink}
        />
      </TouchableOpacity>

      {/* Center — title */}
      <View style={styles.center}>
        {/* <Text style={styles.eyebrow}>BOOKMYSESSION</Text> */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right — avatar */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={handleAvatarPress}
        activeOpacity={0.85}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.avatarRing}>
          <Avatar
            uri={user?.imageUrl}
            name={user?.firstName || "U"}
            size={34}
          />
        </View>
        <View style={styles.onlineDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },

  sideBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
  },

  center: {
    flex: 1,
    alignItems: "center",
    // marginHorizontal: 8,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: fonts.extraBold,
    color: appColors.gold,
    letterSpacing: 2,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: appColors.ink,
    letterSpacing: 0.1,
  },

  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: appColors.goldBorder,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
