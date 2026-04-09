import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Image,
  ScrollView,
  Easing,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { saveToken, saveUserData } from "../../src/services/auth";
import { useAuthStore } from "../../src/store/authStore";
import { appColors } from "../../src/theme/colors";

const { width } = Dimensions.get("window");
const palette = appColors;

const OTP_LENGTH = 6;
const BOX_GAP = 8;
const BOX_SIZE = Math.floor(
  (width - 32 - 44 - BOX_GAP * (OTP_LENGTH - 1)) / OTP_LENGTH,
);

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
  }, [opacity]);

  return <Animated.View style={[styles.cursor, { opacity }]} />;
}

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
          toValue: 1.08,
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
  }, [char, scale]);

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
  }, [fillAnim]);

  useEffect(() => {
    if (secs <= 0) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setSecs((value) => value - 1), 1000);
    return () => clearTimeout(timer);
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

  const focusOtpInput = useCallback(() => {
    const input = inputRef.current;
    if (!input || loading) return;

    if (!keyboardVisibleRef.current) {
      input.blur();
      requestAnimationFrame(() => {
        setTimeout(() => input.focus(), 20);
      });
      return;
    }

    requestAnimationFrame(() => input.focus());
  }, [loading]);

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
          easing: Easing.out(Easing.cubic),
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
  }, [cardSlide, fadeAnim, focusOtpInput, heroSlide]);

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

    if (normalizedOtp.length !== OTP_LENGTH) {
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

      if (res.data.data) {
        if (res.data.data.exist === false) {
          const { token } = res.data.data;
          await saveToken(token);
          router.replace({
            pathname: "/student-profile-setup",
            params: { phone },
          });
          return;
        }

        const { token, user } = res.data.data;
        await saveToken(token);
        await saveUserData(user);
        setUser(user);
        setAuthenticated(true);
        router.replace("/(tabs)/home");
      } else {
        throw new Error("Invalid response");
      }
    } catch (err: any) {
      shake();
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
            <Text style={styles.heroMeta}>VERIFY</Text>
          </View>
        </SafeAreaView>

        <Animated.View
          style={[
            styles.heroEditorial,
            { opacity: fadeAnim, transform: [{ translateY: heroSlide }] },
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

          <Text style={styles.heroTitle}>Verify your number</Text>
          <Text style={styles.heroSub}>Code sent to your WhatsApp</Text>

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
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <View style={styles.stepIndicatorSimplified}>
            <View style={styles.stepDot} />
            <Text style={styles.stepLabelSimple}>Step 2 of 3</Text>
          </View>

          <Text style={styles.cardTitle}>Enter your code</Text>
          <Text style={styles.cardSub}>
            Tap below or type to fill in the digits
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            value={otp}
            autoFocus
            showSoftInputOnFocus
            onChangeText={(value) => {
              const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
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

          <TouchableOpacity activeOpacity={1} onPressIn={focusOtpInput}>
            <View style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <OtpBox
                  key={index}
                  char={otp[index] || ""}
                  focused={otp.length === index}
                  filled={index < otp.length}
                  shakeAnim={shakeAnim}
                />
              ))}
            </View>
          </TouchableOpacity>

          <View style={styles.dotsRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index < otp.length && styles.dotFilled]}
              />
            ))}
          </View>

          <Countdown onResend={handleResend} resending={resending} />

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
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={isComplete ? palette.navy : "#90A4AE"}
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

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

          <View style={styles.trustRow}>
            <TrustBadge icon="lock-closed-outline" label="Encrypted" />
            <TrustBadge icon="shield-checkmark-outline" label="Verified" />
            <TrustBadge icon="people-outline" label="500+ Tutors" />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  hero: {
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 12,
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
  heroTitle: {
    fontSize: 36,
    fontFamily: "Manrope_600SemiBold",
    color: palette.white,
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.78)",
    lineHeight: 19,
    maxWidth: 300,
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
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
  scrollView: { flex: 1 },
  scrollContent: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
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
  cardTitle: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: palette.muted,
    lineHeight: 19,
    marginBottom: 18,
  },
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
    borderColor: palette.navyLight,
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
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.2,
  },
  ctaTextOff: { color: "#90A4AE" },
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
});

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.trustBadge}>
      <Ionicons name={icon as any} size={13} color={palette.gold} />
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  );
}
