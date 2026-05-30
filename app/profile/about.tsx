import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "@/src/theme/colors";
import * as WebBrowser from "expo-web-browser";

const APP_VERSION = "1.0.4";
const BUILD_NUMBER = "104";

const LINKS = [
  {
    id: "terms",
    icon: "document-text-outline",
    label: "Terms of Service",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.1)",
    url: "https://www.bookmysession.in/terms",
  },
  {
    id: "privacy",
    icon: "shield-outline",
    label: "Privacy Policy",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    url: "https://www.bookmysession.in/privacy-policy",
  },
  {
    id: "cookie",
    icon: "browsers-outline",
    label: "Cookie Policy",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    url: "https://www.bookmysession.in/cookie-policy",
  },
];

const SOCIAL = [
  { id: "instagram", icon: "logo-instagram", color: "#E1306C", url: "https://instagram.com/bookmysession" },
  { id: "twitter", icon: "logo-twitter", color: "#1DA1F2", url: "https://twitter.com/bookmysession" },
  { id: "linkedin", icon: "logo-linkedin", color: "#0077B5", url: "https://linkedin.com/company/bookmysession" },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About BookMySession</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Brand card */}
        <View style={styles.brandCardWrap}>
          <LinearGradient
            colors={["#020817", "#0F172A"]}
            style={styles.brandCard}
          >
            {/* Logo */}
            <View style={styles.logoBox}>
              <Ionicons name="book" size={36} color="#E8A838" />
            </View>
            <Text style={styles.brandName}>BookMySession</Text>
            <Text style={styles.brandTagline}>
              Connecting students with the best tutors
            </Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>
                v{APP_VERSION} ({BUILD_NUMBER})
              </Text>
            </View>

            {/* Social links */}
            <View style={styles.socialRow}>
              {SOCIAL.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.socialBtn, { backgroundColor: `${s.color}20` }]}
                  onPress={() => Linking.openURL(s.url)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              BookMySession is dedicated to democratizing quality education by connecting
              students with verified, passionate tutors. We believe every student deserves
              personalized learning experiences that unlock their full potential.
            </Text>
          </View>
        </View>

        {/* Legal links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.linksList}>
            {LINKS.map((link, index) => (
              <View key={link.id}>
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => WebBrowser.openBrowserAsync(link.url)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.linkIcon, { backgroundColor: link.bg }]}>
                    <Ionicons name={link.icon as any} size={20} color={link.color} />
                  </View>
                  <Text style={styles.linkLabel}>{link.label}</Text>
                  <Ionicons name="open-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                {index < LINKS.length - 1 && (
                  <View style={styles.linkDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Version info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.infoCard}>
            {[
              { label: "Version", value: APP_VERSION },
              { label: "Build", value: BUILD_NUMBER },
              { label: "Platform", value: Platform.OS === "ios" ? "iOS" : "Android" },
              { label: "Company", value: "BookMySession Pvt. Ltd." },
            ].map((row, index, arr) => (
              <View key={row.label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
                {index < arr.length - 1 && <View style={styles.linkDivider} />}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2026 BookMySession Pvt. Ltd. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },

  scroll: { paddingBottom: 60 },

  brandCardWrap: { padding: 18, paddingBottom: 6 },
  brandCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(232,168,56,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.25)",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    textAlign: "center",
  },
  versionBadge: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  versionBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "rgba(255,255,255,0.5)",
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  section: { paddingHorizontal: 18, marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  missionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#4B5563",
    lineHeight: 22,
  },

  linksList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  linkDivider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 68 },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },

  copyright: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "#D1D5DB",
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 18,
  },
});
