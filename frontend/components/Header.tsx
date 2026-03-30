import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { colors } from "../src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color={colors.gray[900]} />
      </TouchableOpacity>

      <View style={styles.tabMiddle}>
        <Text style={styles.tabMiddleText}>Login</Text>
      </View>

      {/* <View style={styles.tabContainer}>
        <View style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Login</Text>
        </View>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Sign up</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: colors.white,
  },
  tabMiddle: {
    flex: 1,
    alignItems: "center",
  },
  tabMiddleText: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: colors.gray[900],
  },
  tabContainer: {
    flexDirection: "row",
    gap: 24,
  },
  tab: {
    paddingVertical: 4,
  },

  tabActive: {
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Manrope_500Medium",
    color: colors.gray[600],
  },
  tabTextActive: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: colors.gray[900],
  },
});
