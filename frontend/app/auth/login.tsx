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
  StatusBar,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";

const { width } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.10)",
  goldBorder: "rgba(232,168,56,0.26)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#D9E2EE",
  inputBg: "#F4F7FB",
  error: "#E05252",
};

// ─── Floating Orb ─────────────────────────────────────────────────────────────
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

// ─── Trust Badge ──────────────────────────────────────────────────────────────
function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.trustBadge}>
      <Ionicons name={icon as any} size={13} color={palette.gold} />
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ["Phone", "Verify", "Done"];
  return (
    <View style={styles.stepWrap}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  done && styles.stepCircleDone,
                  active && styles.stepCircleActive,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={11} color={palette.navy} />
                ) : (
                  <Text
                    style={[styles.stepNum, active && styles.stepNumActive]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.stepLabel, active && styles.stepLabelActive]}
              >
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[styles.stepConnector, done && styles.stepConnectorDone]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate checkmark when 10 digits entered
  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: phone.length === 10 ? 1 : 0,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [phone.length === 10]);

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number",
      );
      return;
    }
    setLoading(true);

    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        phoneNumber: `+91${phone}`,
        type: "student",
      });
      
      if (response.data && (response.data.success || response.status === 200)) {
        router.push({
          pathname: "/auth/verify-otp",
          params: { phone: `+91${phone}` },
        });
      } else throw new Error("Failed to send OTP");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to send OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const isValid = phone.length === 10;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Hero ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid, palette.navyLight]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

        {/* Orbs */}
        <FloatingOrb size={130} top={-35} left={width * 0.58} delay={0} />
        <FloatingOrb size={80} top={70} left={-24} delay={600} />
        <FloatingOrb size={48} top={30} left={width * 0.32} delay={1100} />

        <SafeAreaView edges={["top"]}>
          {/* Top-right trust chip */}
          <View style={styles.heroTopRow}>
            <View style={styles.secureChip}>
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={palette.gold}
              />
              <Text style={styles.secureChipText}>Verified & Secure</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Centered logo + text */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={["rgba(232,168,56,0.22)", "rgba(232,168,56,0.08)"]}
              style={styles.logoMark}
            >
              <Image source={require("../../assets/images/Logo.png")} style={styles.logoIcon} />
            </LinearGradient>
            {/* Orbit dot */}
            <View style={styles.orbitDot}>
              <Ionicons name="sparkles" size={10} color={palette.gold} />
            </View>
          </View>

          <Text style={styles.heroTitle}>BookMySession</Text>
          <Text style={styles.heroTagline}>
            Connect with expert teachers,{"\n"}learn without limits.
          </Text>

          {/* Feature pills */}
          <View style={styles.featurePills}>
            {["500+ Tutors", "All Subjects", "Book Instantly"].map((f) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Curve */}
        <View style={styles.heroCurve} />
      </LinearGradient>

      {/* ── Scrollable card area ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: cardAnim, transform: [{ translateY: cardTranslate }] },
          ]}
        >
          {/* Step indicator */}
          <StepIndicator current={0} />

          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSubtitle}>
              We&lsquo;ll send a one-time code to your WhatsApp
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Phone input */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>

            <View
              style={[
                styles.inputRow,
                focused && styles.inputRowFocused,
                isValid && styles.inputRowValid,
              ]}
            >
              {/* Country selector */}
              <TouchableOpacity style={styles.countryBadge} activeOpacity={0.7}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                {/* <Ionicons name="chevron-down" size={11} color={palette.muted} /> */}
              </TouchableOpacity>

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

              {/* Animated checkmark */}
              <Animated.View
                style={[
                  styles.validBadge,
                  { transform: [{ scale: checkScale }] },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={palette.gold}
                />
              </Animated.View>
            </View>

            {/* Char count + helper row */}
            <View style={styles.inputFooter}>
              <View style={styles.helperRow}>
                <Text style={styles.helperText}>OTP will send via WhatsApp</Text>
              </View>
              <Text
                style={[styles.charCount, isValid && styles.charCountValid]}
              >
                {phone.length}/10
              </Text>
            </View>
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                (!isValid || loading) && styles.ctaButtonOff,
              ]}
              onPress={handleSendOTP}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={
                  isValid && !loading
                    ? [palette.gold, "#D4922A"]
                    : ["#C8D4E0", "#B8C8D8"]
                }
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={palette.navy} size="small" />
                ) : (
                  <View style={styles.ctaInner}>
                    <Text
                      style={[styles.ctaText, !isValid && styles.ctaTextOff]}
                    >
                      Send OTP
                    </Text>
                    {/* <View
                      style={[
                        styles.ctaArrow,
                        isValid && styles.ctaArrowActive,
                      ]}
                    > */}
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={isValid ? palette.navy : "#90A4AE"}
                      />
                    {/* </View> */}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isValid && (
              <Text style={styles.ctaHint}>⚡ Takes less than 10 seconds</Text>
            )}
          </Animated.View>

          {/* OR */}
          {/* <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View> */}

          {/* Google */}
          {/* <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleGlyph}>G</Text>
            </View>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity> */}

          {/* Trust badges */}
          <View style={styles.trustRow}>
            <TrustBadge icon="lock-closed-outline" label="Encrypted" />
            <TrustBadge icon="shield-checkmark-outline" label="Verified" />
            <TrustBadge icon="people-outline" label="500+ Tutors" />
          </View>
        </Animated.View>

        {/* Terms */}
        <Animated.View style={[styles.termsRow, { opacity: cardAnim }]}>
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
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(232,168,56,0.11)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  secureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232,168,56,0.14)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.25)",
  },
  secureChipText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: palette.goldLight,
    letterSpacing: 0.3,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  logoWrap: {
    position: "relative",
    marginBottom: 4,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.38)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    height: 28,
    width: 28,
    resizeMode: "contain",
    color: palette.gold,
  },
  orbitDot: {
    position: "absolute",
    // width: 8,
    // height: 8,
    borderRadius: 4,
    // backgroundColor: palette.gold,
    bottom: 2,
    right: 0,
    // borderWidth: 2,
    // borderColor: palette.navyMid,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: -0.7,
  },
  heroTagline: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.58)",
    textAlign: "center",
    lineHeight: 20,
  },
  featurePills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  featurePill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  featurePillText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: "rgba(255,255,255,0.60)",
    letterSpacing: 0.3,
  },
  heroCurve: {
    height: 28,
    backgroundColor: palette.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 10,
  },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // ── Card ──
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 14,
  },

  // ── Step indicator ──
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: palette.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleDone: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  stepCircleActive: {
    borderColor: palette.navy,
    backgroundColor: palette.navy,
  },
  stepNum: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: palette.muted,
  },
  stepNumActive: {
    color: palette.gold,
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  stepLabelActive: {
    color: palette.ink,
    fontFamily: "Manrope_700Bold",
  },
  stepConnector: {
    width: 36,
    height: 2,
    backgroundColor: palette.border,
    marginHorizontal: 4,
    marginBottom: 14,
  },
  stepConnectorDone: {
    backgroundColor: palette.gold,
  },

  // Card header
  cardHeader: { marginBottom: 16 },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 3,
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
    marginBottom: 18,
    opacity: 0.55,
  },

  // ── Input ──
  fieldWrapper: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 9,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.border,
    height: 56,
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: palette.gold,
    backgroundColor: palette.white,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRowValid: {
    borderColor: palette.gold,
  },
  countryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 13,
  },
  countryFlag: { fontSize: 17 },
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
    paddingHorizontal: 13,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    color: palette.ink,
    height: "100%",
    letterSpacing: 0.5,
  },
  validBadge: {
    paddingRight: 13,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
    marginHorizontal: 2,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  helperText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  charCount: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
  },
  charCountValid: {
    color: palette.gold,
  },

  // ── CTA ──
  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 5,
  },
  ctaButtonOff: {
    shadowOpacity: 0,
    elevation: 0,
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
  ctaTextOff: { color: "#90A4AE" },
  ctaArrow: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaArrowActive: {
    backgroundColor: "rgba(13,27,42,0.12)",
  },
  ctaHint: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },

  // ── OR ──
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    marginTop: 4,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  orText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
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
    paddingVertical: 14,
    marginBottom: 18,
  },
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F0F4FF",
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

  // ── Trust badges ──
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: palette.goldPale,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  trustBadgeText: {
    fontSize: 10,
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
