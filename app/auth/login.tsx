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
  StatusBar,
  Image,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { appColors } from "../../src/theme/colors";

const palette = appColors;

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heroScaleAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 400,
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
  }, [fadeAnim, slideAnim, heroScaleAnim, contentFadeAnim, cardAnim]);

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit number");
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

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const isValid = phone.length === 10;

  useEffect(() => {
    if (isValid) {
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(checkScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isValid, checkScale]);

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

      <LinearGradient
        colors={["#0D1B2A", "#142B3C"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              style={styles.heroBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={palette.white} />
            </TouchableOpacity>
            <Text style={styles.heroMeta}>LOGIN</Text>
          </View>
        </SafeAreaView>

        <Animated.View
          style={[
            styles.heroEditorial,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heroBrandRow}>
            <View style={styles.logoBadgeSmall}>
              <Image
                source={require("../../assets/images/Logo.png")}
                style={styles.logoImageSmall}
              />
            </View>
            <Text style={styles.heroBrand}>BOOK MY SESSION</Text>
          </View>

          <Animated.View
            style={{
              opacity: contentFadeAnim,
              transform: [{ scale: heroScaleAnim }],
            }}
          >
            <Text style={styles.heroLineOne}>Your Learning</Text>
            <Text style={styles.heroLineTwo}>Starts Here.</Text>
          </Animated.View>

          <Text style={styles.heroSub}>
            Access verified mentors and start high-impact sessions in minutes.
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* <View style={styles.design} /> */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardAnim, transform: [{ translateY: cardTranslate }] },
          ]}
        >
          <View style={styles.stepIndicatorSimplified}>
            <View style={styles.stepDot} />
            <Text style={styles.stepLabelSimple}>Step 1 of 3</Text>
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Enter your mobile number to continue
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>

            <View
              style={[
                styles.inputRow,
                focused && styles.inputRowFocused,
                isValid && styles.inputRowValid,
              ]}
            >
              <TouchableOpacity style={styles.countryBadge} activeOpacity={0.7}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
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

            <View style={styles.inputFooter}>
              <View style={styles.helperRow}>
                <Text style={styles.helperText}>
                  OTP will send via WhatsApp
                </Text>
              </View>
              <Text
                style={[styles.charCount, isValid && styles.charCountValid]}
              >
                {phone.length}/10
              </Text>
            </View>
          </View>

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
                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={isValid ? palette.navy : "#90A4AE"}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isValid && (
              <Text style={styles.ctaHint}>Takes less than 10 seconds</Text>
            )}
          </Animated.View>

          <View style={styles.trustRow}>
            <TrustBadge icon="lock-closed-outline" label="Encrypted" />
            <TrustBadge icon="shield-checkmark-outline" label="Verified" />
            <TrustBadge icon="people-outline" label="500+ Tutors" />
          </View>
        </Animated.View>

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

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.trustBadge}>
      <Ionicons name={icon as any} size={13} color={palette.gold} />
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },

  hero: {
    overflow: "hidden",
    paddingBottom: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "center",
  },
  heroBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroMeta: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.4,
  },
  heroEditorial: {
    marginTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 12,
  },
  heroBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadgeSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(232,168,56,0.16)",
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImageSmall: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  heroBrand: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: "rgba(255,255,255,0.84)",
    letterSpacing: 1.2,
  },
  heroLineOne: {
    fontSize: 36,
    fontFamily: "Manrope_600SemiBold",
    color: palette.white,
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  heroLineTwo: {
    fontSize: 36,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.gold,
    letterSpacing: -1.1,
    lineHeight: 40,
    marginTop: -4,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.78)",
    lineHeight: 19,
    maxWidth: 300,
  },

  scrollView: { flex: 1, position: "relative" },
  scrollContent: {
    position: "relative",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  design: { 
    position: "absolute",
    top: -28,
    left: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(232,168,56,0.08)",
     borderWidth: 1,
    borderColor: "rgba(232,168,56,0.24)",
     zIndex: 0,
  },

  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 14,
  },
  stepIndicatorSimplified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.navy,
  },
  stepLabelSimple: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
    letterSpacing: 0.4,
  },

  cardHeader: { marginBottom: 16 },
  cardTitle: {
    fontSize: 24,
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
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
    borderColor: palette.goldDark,
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

  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  ctaButtonOff: {
    shadowOpacity: 0.15,
    elevation: 2,
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
  ctaHint: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },

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
