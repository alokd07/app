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
  Animated,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { saveToken, saveUserData } from "../../src/services/auth";
import { useAuthStore } from "../../src/store/authStore";
import { LoginResponse } from "../../src/types";

const { width } = Dimensions.get("window");

// ─── Design Tokens (must match LoginScreen) ───────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#D9E2EE",
  inputBg: "#F4F7FB",
  success: "#27AE60",
};

const OTP_LENGTH = 6;

// ─── Single OTP Box ───────────────────────────────────────────────────────────
function OtpBox({
  char,
  focused,
  shake,
}: {
  char: string;
  focused: boolean;
  shake: Animated.Value;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (char) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 40,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
        }),
      ]).start();
    }
  }, [char]);

  return (
    <Animated.View
      style={[
        styles.otpBox,
        focused && styles.otpBoxFocused,
        char && styles.otpBoxFilled,
        { transform: [{ scale: scaleAnim }, { translateX: shake }] },
      ]}
    >
      {char ? (
        <Text style={styles.otpChar}>{char}</Text>
      ) : focused ? (
        <View style={styles.cursor} />
      ) : null}
    </Animated.View>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({
  onExpire,
  onResend,
  resending,
}: {
  onExpire: () => void;
  onResend: () => void;
  resending: boolean;
}) {
  const [seconds, setSeconds] = useState(30);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setExpired(true);
      onExpire();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleResend = () => {
    setSeconds(30);
    setExpired(false);
    onResend();
  };

  if (expired) {
    return (
      <TouchableOpacity onPress={handleResend} disabled={resending}>
        {resending ? (
          <ActivityIndicator size="small" color={palette.gold} />
        ) : (
          <Text style={styles.resendActive}>Resend OTP</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Text style={styles.resendTimer}>
      Resend in{" "}
      <Text style={styles.resendTimerBold}>
        0:{String(seconds).padStart(2, "0")}
      </Text>
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VerifyOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const { setUser, setAuthenticated } = useAuthStore();

  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
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
    ]).start(() => {
      inputRef.current?.focus();
    });
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== OTP_LENGTH) {
      shake();
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.VERIFY_OTP, {
        phone,
        otp,
      });
      
      if (response.data?.data) {
        const { token, user } = response.data.data;
        await saveToken(token);
        await saveUserData(user);
        setUser(user);
        setAuthenticated(true);
        
        Alert.alert("Success!", "Login successful", [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)/home");
            },
          },
        ]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      shake();
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.SEND_OTP, { phone });
      Alert.alert("Sent!", "A new OTP has been sent to your WhatsApp.");
    } catch {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Progress ring fill
  const progress = otp.length / OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Hero Strip ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid, palette.navyLight]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.accentLine} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={palette.white} />
        </TouchableOpacity>

        {/* Shield icon with progress ring */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.shieldWrap}>
            <View style={styles.shieldRing}>
              {/* Progress arc as segments */}
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor:
                        i < otp.length
                          ? palette.gold
                          : "rgba(255,255,255,0.15)",
                      transform: [
                        { rotate: `${i * 60}deg` },
                        { translateX: 36 },
                      ],
                    },
                  ]}
                />
              ))}
              <View style={styles.shieldIcon}>
                <Ionicons
                  name={
                    otp.length === OTP_LENGTH
                      ? "shield-checkmark"
                      : "shield-outline"
                  }
                  size={32}
                  color={
                    otp.length === OTP_LENGTH ? palette.gold : palette.white
                  }
                />
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>Verify your number</Text>
          <View style={styles.phonePill}>
            <Ionicons name="logo-whatsapp" size={13} color={palette.gold} />
            <Text style={styles.phonePillText}>{phone}</Text>
          </View>
        </Animated.View>

        <View style={styles.heroCurve} />
      </LinearGradient>

      {/* ── Card ── */}
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.cardLabel}>Enter 6-digit code</Text>

        {/* Hidden real input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          value={otp}
          onChangeText={(v) => {
            setOtp(v);
            if (v.length === OTP_LENGTH) {
              // Auto-verify after short delay
              setTimeout(() => {
                if (v.length === OTP_LENGTH) handleVerifyOTP();
              }, 300);
            }
          }}
          editable={!loading}
          autoFocus={false}
        />

        {/* Visual OTP boxes */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          <Animated.View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <OtpBox
                key={i}
                char={otp[i] || ""}
                focused={otp.length === i}
                shake={shakeAnim}
              />
            ))}
          </Animated.View>
        </TouchableOpacity>

        {/* Resend row */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn&apos;t receive it? </Text>
          <CountdownTimer
            onExpire={() => setTimerExpired(true)}
            onResend={handleResendOTP}
            resending={resending}
          />
        </View>

        {/* Verify CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (loading || otp.length < OTP_LENGTH) && styles.ctaDisabled,
          ]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length < OTP_LENGTH}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={
              otp.length === OTP_LENGTH
                ? [palette.gold, "#D4922A"]
                : ["#C8D4E0", "#B0BEC5"]
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
                  style={[
                    styles.ctaText,
                    otp.length < OTP_LENGTH && styles.ctaTextMuted,
                  ]}
                >
                  Verify & Continue
                </Text>
                <View
                  style={[
                    styles.ctaArrow,
                    otp.length < OTP_LENGTH && styles.ctaArrowMuted,
                  ]}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={otp.length === OTP_LENGTH ? palette.navy : "#90A4AE"}
                  />
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Change number */}
        <TouchableOpacity
          style={styles.changeRow}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={14} color={palette.muted} />
          <Text style={styles.changeText}>Change phone number</Text>
        </TouchableOpacity>
      </Animated.View>
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
    height: 280,
    overflow: "hidden",
    position: "relative",
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: palette.gold,
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
  },
  shieldWrap: {
    marginBottom: 16,
  },
  shieldRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressSegment: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    top: "50%",
    left: "50%",
    marginTop: -3,
    marginLeft: -3,
  },
  shieldIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(232,168,56,0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.3)",
  },
  phonePillText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.goldLight,
    letterSpacing: 0.5,
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

  // ── Card ──
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: palette.ink,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 20,
  },

  // ── OTP Boxes ──
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  otpBox: {
    width: (width - 40 - 48 - 10 * 5) / 6,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxFocused: {
    borderColor: palette.gold,
    backgroundColor: palette.white,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: palette.navy,
    backgroundColor: palette.white,
  },
  otpChar: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  cursor: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: palette.gold,
  },

  // ── Resend ──
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resendLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  resendTimer: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  resendTimerBold: {
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  resendActive: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
    textDecorationLine: "underline",
  },

  // ── CTA ──
  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: {
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
  ctaTextMuted: {
    color: "#90A4AE",
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    // backgroundColor: "rgba(13,27,42,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaArrowMuted: {
    // backgroundColor: "rgba(0,0,0,0.06)",
    backgroundColor: "rgba(0,0,0,0.00)",
  },

  // ── Change number ──
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  changeText: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
});
