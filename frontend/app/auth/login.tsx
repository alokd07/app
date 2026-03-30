import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "#FDF3DC",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#D9E2EE",
  inputBg: "#F4F7FB",
  error: "#E05252",
};

// ─── Floating Orb Component ───────────────────────────────────────────────────
function FloatingOrb({
  size,
  top,
  left,
  delay,
}: {
  size: number;
  top: number;
  left: number;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3200 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3200 + delay,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  return (
    <Animated.View
      style={[
        styles.orb,
        { width: size, height: size, top, left },
        { transform: [{ translateY }] },
      ]}
    />
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number",
      );
      return;
    }
    // setLoading(true);
    return router.push({
      pathname: "/auth/verify-otp",
      params: { phone: `+91${phone}` },
    });
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        phone: `+91${phone}`,
      });
      if (response.data && (response.data.success || response.status === 200)) {
        router.push({
          pathname: "/auth/verify-otp",
          params: { phone: `+91${phone}` },
        });
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to send OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Hero Header ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid, palette.navyLight]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative orbs */}
        <FloatingOrb size={120} top={-30} left={width * 0.6} delay={0} />
        <FloatingOrb size={80} top={80} left={-20} delay={600} />
        <FloatingOrb size={50} top={40} left={width * 0.3} delay={1200} />

        {/* Gold accent line */}
        <View style={styles.accentLine} />

        {/* Logo mark */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <Text style={styles.heroTitle}>BookMySession</Text>
          <Text style={styles.heroTagline}>
            Connect with expert teachers,{"\n"}learn without limits.
          </Text>
        </Animated.View>

        {/* Bottom curve */}
        <View style={styles.heroCurve} />
      </LinearGradient>

      {/* ── Card Section ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            },
          ]}
        >
          {/* Card header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSubtitle}>
              We&apos;ll send a one-time code to verify your number
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Phone field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
              {/* Country badge */}
              <View style={styles.countryBadge}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                <Ionicons name="chevron-down" size={12} color={palette.muted} />
              </View>

              <View style={styles.inputDivider} />

              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit number"
                placeholderTextColor={palette.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              {phone.length === 10 && (
                <View style={styles.validBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={palette.gold}
                  />
                </View>
              )}
            </View>

            {/* Helper */}
            <Text style={styles.helperText}>
              <Ionicons name="logo-whatsapp" size={11} color={palette.muted} />{" "}
              OTP will be sent via WhatsApp
            </Text>
          </View>

          {/* CTA Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaButtonLoading]}
              onPress={handleSendOTP}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={
                  loading
                    ? [palette.goldLight, palette.goldLight]
                    : [palette.gold, "#D4922A"]
                }
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={palette.navy} size="small" />
                ) : (
                  <View style={styles.ctaInner}>
                    <Text style={styles.ctaText}>Send OTP</Text>
                    <View style={styles.ctaArrow}>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={palette.navy}
                      />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Separator */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
            <View style={styles.googleIcon}>
              {/* Simple G logo using coloured dots */}
              <Text style={styles.googleGlyph}>G</Text>
            </View>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Terms */}
        <Animated.View style={[styles.termsRow, { opacity: cardOpacity }]}>
          <Text style={styles.termsText}>
            By continuing you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {" & "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },

  // ── Hero ──
  hero: {
    height: 270,
    overflow: "hidden",
    position: "relative",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(232,168,56,0.12)",
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: palette.gold,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(232,168,56,0.18)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 22,
    color: palette.gold,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.60)",
    textAlign: "center",
    lineHeight: 20,
  },
  heroCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: palette.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // ── Card ──
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 16,
  },
  cardHeader: { marginBottom: 20 },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: 20,
    opacity: 0.6,
  },

  // ── Input ──
  fieldWrapper: { marginBottom: 24 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.border,
    overflow: "hidden",
    height: 56,
  },
  inputRowFocused: {
    borderColor: palette.gold,
    backgroundColor: palette.white,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  countryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
  },
  countryFlag: { fontSize: 18 },
  countryCode: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
  },
  inputDivider: {
    width: 1,
    height: 28,
    backgroundColor: palette.border,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    color: palette.ink,
    height: "100%",
  },
  validBadge: { paddingRight: 14 },
  helperText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    marginTop: 8,
    marginLeft: 2,
  },

  // ── CTA ──
  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaButtonLoading: {
    shadowOpacity: 0.1,
  },
  ctaGradient: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    // borderRadius: 8,
    // backgroundColor: "rgba(13,27,42,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── OR row ──
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  orText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Google ──
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.border,
    paddingVertical: 15,
  },
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  googleGlyph: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
  },

  // ── Terms ──
  termsRow: {
    paddingHorizontal: 8,
    alignItems: "center",
  },
  termsText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    lineHeight: 17,
  },
  termsLink: {
    fontFamily: "Manrope_600SemiBold",
    color: palette.navy,
    textDecorationLine: "underline",
  },
});
