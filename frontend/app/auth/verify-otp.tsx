import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { saveToken, saveUserData } from "../../src/services/auth";
import { useAuthStore } from "../../src/store/authStore";

const { width } = Dimensions.get("window");

const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.10)",
  goldBorder: "rgba(232,168,56,0.28)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#D9E2EE",
  inputBg: "#F4F7FB",
};

const OTP_LENGTH = 6;
const BOX_GAP = 8;
const BOX_SIZE = Math.floor(
  (width - 32 - 44 - BOX_GAP * (OTP_LENGTH - 1)) / OTP_LENGTH,
);

// ─── Blinking cursor ──────────────────────────────────────────────────────────
function BlinkCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 530,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 530,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[styles.cursor, { opacity }]} />;
}

// ─── OTP Box ──────────────────────────────────────────────────────────────────
function OtpBox({
  char,
  focused,
  filled,
  shakeAnim,
}: {
  char: string;
  focused: boolean;
  filled: boolean;
  shakeAnim: Animated.Value;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (char) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.13,
          speed: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [char]);

  return (
    <Animated.View
      style={[
        styles.otpBox,
        focused && styles.otpBoxFocused,
        filled && styles.otpBoxFilled,
        { transform: [{ scale }, { translateX: shakeAnim }] },
      ]}
    >
      {char ? (
        <Text style={styles.otpChar}>{char}</Text>
      ) : focused ? (
        <BlinkCursor />
      ) : null}
    </Animated.View>
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

// ─── Circular Shield ──────────────────────────────────────────────────────────
function ShieldProgress({ count, total }: { count: number; total: number }) {
  return (
    <View style={styles.shieldOuter}>
      {/* Dot ring */}
      {Array.from({ length: total }).map((_, i) => {
        const angle = ((360 / total) * i - 90) * (Math.PI / 180);
        const r = 46;
        const cx = 52 + r * Math.cos(angle);
        const cy = 52 + r * Math.sin(angle);
        return (
          <View
            key={i}
            style={[
              styles.ringDot,
              {
                left: cx - 5,
                top: cy - 5,
                backgroundColor:
                  i < count ? palette.gold : "rgba(255,255,255,0.18)",
              },
            ]}
          />
        );
      })}
      {/* Center */}
      <View style={styles.shieldCenter}>
        <Ionicons
          name={count === total ? "shield-checkmark" : "shield-outline"}
          size={36}
          color={count === total ? palette.gold : "rgba(255,255,255,0.80)"}
        />
      </View>
    </View>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({
  onResend,
  resending,
}: {
  onResend: () => void;
  resending: boolean;
}) {
  const [secs, setSecs] = useState(30);
  const [done, setDone] = useState(false);
  const fillAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 30000,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (secs <= 0) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const handleResend = () => {
    setSecs(30);
    setDone(false);
    fillAnim.setValue(1);
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 30000,
      useNativeDriver: false,
    }).start();
    onResend();
  };

  const barWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (done) {
    return (
      <TouchableOpacity
        onPress={handleResend}
        disabled={resending}
        style={styles.resendBtn}
        activeOpacity={0.8}
      >
        {resending ? (
          <ActivityIndicator size="small" color={palette.gold} />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={14} color={palette.gold} />
            <Text style={styles.resendBtnText}>Resend OTP</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.countdownWrap}>
      <View style={styles.countdownTrack}>
        <Animated.View style={[styles.countdownFill, { width: barWidth }]} />
      </View>
      <Text style={styles.countdownText}>
        Resend in{" "}
        <Text style={styles.countdownBold}>
          0:{String(secs).padStart(2, "0")}
        </Text>
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VerifyOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { setUser, setAuthenticated } = useAuthStore();

  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-16)).current;
  const cardSlide = useRef(new Animated.Value(28)).current;
  const keyboardVisibleRef = useRef(false);
  const autoVerifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusOtpInput = () => {
    const input = inputRef.current;
    if (!input || loading) return;

    // If keyboard is hidden while input is still focused, force a refocus cycle.
    if (!keyboardVisibleRef.current) {
      input.blur();
      requestAnimationFrame(() => {
        setTimeout(() => input.focus(), 20);
      });
      return;
    }

    // Normal focus path while keyboard is already visible.
    requestAnimationFrame(() => input.focus());
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      keyboardVisibleRef.current = true;
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisibleRef.current = false;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(heroSlide, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 52,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start(() => focusOtpInput());
  }, []);

  useEffect(() => {
    return () => {
      if (autoVerifyTimerRef.current) {
        clearTimeout(autoVerifyTimerRef.current);
      }
    };
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 65,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
        duration: 65,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 65,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 65,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 65,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const normalizedOtp = (otpValue ?? otp)
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    console.log(
      "Verifying OTP:",
      normalizedOtp,
      "length:",
      normalizedOtp.length,
      OTP_LENGTH
    );
    if (normalizedOtp.length !== OTP_LENGTH) {
      console.log("OTP incomplete, cannot verify");
      shake();
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);

    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.VERIFY_OTP, {
        phoneNumber: phone,
        otp: normalizedOtp,
        type: "student",
      });
      console.log("OTP verification response:", res.data.data);
      if (res.data.data) {
        if (res.data.data.exist === false) {
          // New user flow - navigate to profile setup with token and phone
          const { token } = res.data.data;
          await saveToken(token);
          router.replace({
            pathname: "/profile-setup",
            query: { phone, token },
          });
          return;
        }
        const { token, user } = res.data.data;
        await saveToken(token);
        await saveUserData(user);
        setUser(user);
        setAuthenticated(true);
        router.replace("/(tabs)/home");
      } else throw new Error("Invalid response");
    } catch (err: any) {
      shake();
      console.log("OTP verification error:", err.response?.data || err.message || err);
      Alert.alert(
        "Verification Failed",
        err.response?.data?.message || "Invalid OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.RESEND_OTP, {
        phoneNumber: phone,
        type: "student",
      });
      Alert.alert("Sent!", "A new OTP has been sent to your WhatsApp.");
    } catch {
      Alert.alert("Error", "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const isComplete = otp.length === OTP_LENGTH;

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
        <View style={styles.accentLine} />

        <SafeAreaView edges={["top"]}>
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={16} color={palette.white} />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <ShieldProgress count={otp.length} total={OTP_LENGTH} />
          <Text style={styles.heroTitle}>Verify your number</Text>
          <Text style={styles.heroSub}>Code sent to your WhatsApp</Text>

          {/* Phone pill with edit */}
          <View style={styles.phonePill}>
            <Ionicons name="logo-whatsapp" size={13} color={palette.gold} />
            <Text style={styles.phonePillText}>{phone}</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 8 }}
            >
              <Ionicons
                name="pencil-outline"
                size={12}
                color="rgba(242,194,106,0.7)"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.heroCurve} />
      </LinearGradient>

      {/* ── Card ── */}
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: cardSlide }] },
        ]}
      >
        {/* Step tracker */}
        <StepIndicator current={1} />

        <Text style={styles.cardTitle}>Enter your code</Text>
        <Text style={styles.cardSub}>
          Tap below or type to fill in the digits
        </Text>

        {/* Hidden input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          value={otp}
          autoFocus
          showSoftInputOnFocus
          onChangeText={(v) => {
            const cleaned = v.replace(/\D/g, "").slice(0, OTP_LENGTH);
            setOtp(cleaned);
            if (autoVerifyTimerRef.current) {
              clearTimeout(autoVerifyTimerRef.current);
            }
            if (cleaned.length === OTP_LENGTH) {
              autoVerifyTimerRef.current = setTimeout(
                () => handleVerifyOTP(cleaned),
                320,
              );
            }
          }}
          editable={!loading}
        />

        {/* OTP boxes */}
        <TouchableOpacity activeOpacity={1} onPressIn={focusOtpInput}>
          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <OtpBox
                key={i}
                char={otp[i] || ""}
                focused={otp.length === i}
                filled={i < otp.length}
                shakeAnim={shakeAnim}
              />
            ))}
          </View>
        </TouchableOpacity>

        {/* Dot progress */}
        <View style={styles.dotsRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < otp.length && styles.dotFilled]}
            />
          ))}
        </View>

        {/* Countdown */}
        <Countdown onResend={handleResend} resending={resending} />

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!isComplete || loading) && styles.ctaOff]}
          onPress={() => handleVerifyOTP()}
          disabled={!isComplete || loading}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={
              isComplete ? [palette.gold, "#D4922A"] : ["#C8D4E0", "#B8C8D8"]
            }
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={palette.navy} size="small" />
            ) : (
              <View style={styles.ctaInner}>
                <Text
                  style={[styles.ctaText, !isComplete && styles.ctaTextOff]}
                >
                  Verify & Continue
                </Text>
                {/* <View
                  style={[styles.ctaArrow, isComplete && styles.ctaArrowOn]}
                > */}
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={isComplete ? palette.navy : "#90A4AE"}
                />
                {/* </View> */}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Trust footer */}
        <View style={styles.trustRow}>
          <Ionicons
            name="lock-closed-outline"
            size={11}
            color={palette.muted}
          />
          <Text style={styles.trustText}>
            Secured with end-to-end encryption
          </Text>
        </View>
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

  // Hero
  hero: {},
  accentLine: {
    height: 3,
    backgroundColor: palette.gold,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  backLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.white,
  },
  heroContent: {
    alignItems: "center",
    paddingVertical: 22,
    gap: 8,
  },
  heroTitle: {
    fontSize: 21,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.52)",
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(232,168,56,0.13)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.26)",
  },
  phonePillText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: palette.goldLight,
    letterSpacing: 0.6,
  },
  heroCurve: {
    height: 28,
    backgroundColor: palette.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Shield ring
  shieldOuter: {
    width: 104,
    height: 104,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ringDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shieldCenter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Card
  card: {
    marginHorizontal: 16,
    marginTop: -4,
    backgroundColor: palette.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 8,
  },

  // Step indicator
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
    backgroundColor: "transparent",
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

  cardTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    textAlign: "center",
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    textAlign: "center",
    marginBottom: 18,
  },

  // OTP
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
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
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: palette.navy,
    backgroundColor: palette.white,
  },
  otpChar: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  cursor: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: palette.gold,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.border,
  },
  dotFilled: {
    backgroundColor: palette.gold,
  },

  // Countdown
  countdownWrap: {
    alignItems: "center",
    gap: 7,
    marginBottom: 18,
  },
  countdownTrack: {
    width: "65%",
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.border,
    overflow: "hidden",
  },
  countdownFill: {
    height: "100%",
    backgroundColor: palette.gold,
    borderRadius: 2,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
  countdownBold: {
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: palette.goldPale,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  resendBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.gold,
  },

  // CTA
  cta: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaOff: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ctaText: {
    fontSize: 15,
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
  ctaArrowOn: {
    backgroundColor: "rgba(13,27,42,0.12)",
  },

  // Trust
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  trustText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
  },
});
