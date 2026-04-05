import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const P = {
  navy: "#0D1B2A",
  gold: "#E8A838",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#E4EAF2",
};

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
  const title =
    typeof options.headerTitle === "string"
      ? options.headerTitle
      : typeof options.title === "string"
        ? options.title
        : routeNameToTitle(route.name);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <LinearGradient
        colors={["#FFF8EC", "#F7E9CD", "#F4E1BD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.iconBtn, !back && styles.iconBtnGhost]}
            onPress={() =>
              back
                ? navigation.goBack()
                : navigation.navigate("(tabs)" as never)
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name={back ? "chevron-back" : "home-outline"}
              size={20}
              color={P.ink}
            />
          </TouchableOpacity>

          <View style={styles.centerTitle}>
            <Text style={styles.eyebrow}>BOOKMYSESSION</Text>
            <Text style={styles.mainTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <View style={styles.profileBtn}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            <View style={styles.activeDot} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: P.cream,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  hero: {
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.06)",
  },
  heroGlowTop: {
    position: "absolute",
    top: -42,
    right: -28,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  heroGlowBottom: {
    position: "absolute",
    bottom: -52,
    left: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(232,168,56,0.14)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.64)",
    borderColor: "rgba(255,255,255,0.55)",
  },
  centerTitle: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
    color: P.muted,
    letterSpacing: 1.8,
    marginBottom: -1,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: P.ink,
  },
  profileBtn: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.white,
  },
  avatarText: {
    color: P.gold,
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
  },
  activeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: P.gold,
    borderWidth: 2,
    borderColor: P.cream,
  },
});
