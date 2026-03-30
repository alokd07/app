import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { isAuthenticated } from "../src/services/auth";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.12)",
  goldBorder: "rgba(232,168,56,0.28)",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.45)",
};

// ─── Animated Ring ────────────────────────────────────────────────────────────
function PulseRing({ delay, size }: { delay: number; size: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.6],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.5, 0.2, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

// ─── Loading Bar ──────────────────────────────────────────────────────────────
function LoadingBar({ progress }: { progress: Animated.Value }) {
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.55],
  });

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width: barWidth }]} />
    </View>
  );
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({
  x,
  y,
  size,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.7, 0.7, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, left: x, top: y },
        { transform: [{ translateY }], opacity },
      ]}
    />
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SplashScreen() {
  // Staggered entrance animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(24)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const starSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");

    // ── Sequence ──
    Animated.sequence([
      // 1. Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 38,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // 2. Text slides up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 3. Tagline fades
      Animated.delay(80),
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // 4. Loading bar
      Animated.delay(120),
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Star spin loop
    Animated.loop(
      Animated.timing(starSpin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Progress bar fills over auth check duration
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Auth check + navigate
    const timer = setTimeout(async () => {
      const authenticated = await isAuthenticated();
      router.replace(authenticated ? "/(tabs)/home" : "/onboarding");
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  const spinDeg = starSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Background ── */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid, palette.navyLight]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
      />

      {/* ── Floating particles ── */}
      <Particle x={width * 0.12} y={height * 0.18} size={5} delay={0} />
      <Particle x={width * 0.78} y={height * 0.22} size={4} delay={400} />
      <Particle x={width * 0.88} y={height * 0.6} size={6} delay={800} />
      <Particle x={width * 0.08} y={height * 0.65} size={4} delay={1200} />
      <Particle x={width * 0.55} y={height * 0.82} size={5} delay={600} />

      {/* ── Gold accent line top ── */}
      <View style={styles.accentLine} />

      {/* ── Content ── */}
      <View style={styles.center}>
        {/* Pulse rings behind logo */}
        <View style={styles.logoWrap}>
          <PulseRing size={200} delay={600} />
          <PulseRing size={160} delay={1100} />

          {/* Logo mark */}
          <Animated.View
            style={[
              styles.logoOuter,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoInner}>
              {/* Spinning star accent */}
              <Animated.Text
                style={[
                  styles.starAccent,
                  { transform: [{ rotate: spinDeg }] },
                ]}
              >
                ✦
              </Animated.Text>

              {/* Book + session icon composed from text */}
              <Text style={styles.logoEmoji}>📚</Text>
            </View>
          </Animated.View>
        </View>

        {/* App name */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textSlide }],
            alignItems: "center",
          }}
        >
          <Text style={styles.appName}>BookMySession</Text>

          {/* Gold divider with stars */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerStar}>✦</Text>
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          LEARN · GROW · EXCEL
        </Animated.Text>
      </View>

      {/* ── Bottom section ── */}
      <Animated.View style={[styles.bottom, { opacity: barOpacity }]}>
        <Text style={styles.loadingLabel}>Loading your experience</Text>
        <LoadingBar progress={progress} />
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>

      {/* ── Bottom gold line ── */}
      <LinearGradient
        colors={[palette.gold, palette.goldLight, palette.gold]}
        style={styles.bottomLine}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.navy,
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: palette.gold,
    zIndex: 10,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // ── Particles ──
  particle: {
    position: "absolute",
    backgroundColor: palette.gold,
  },

  // ── Center ──
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  // ── Logo ──
  logoWrap: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: palette.gold,
  },
  logoOuter: {
    width: 108,
    height: 108,
    borderRadius: 30,
    backgroundColor: palette.goldPale,
    borderWidth: 1.5,
    borderColor: palette.goldBorder,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  starAccent: {
    fontSize: 11,
    color: palette.gold,
    position: "absolute",
    top: -22,
    opacity: 0.7,
  },
  logoEmoji: {
    fontSize: 44,
  },

  // ── Text ──
  appName: {
    fontSize: 32,
    fontFamily: "Manrope_800ExtraBold",
    color: palette.white,
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  dividerLine: {
    width: 40,
    height: 1.5,
    backgroundColor: palette.gold,
    borderRadius: 1,
    opacity: 0.6,
  },
  dividerStar: {
    fontSize: 10,
    color: palette.gold,
  },
  tagline: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
    letterSpacing: 3.5,
    textTransform: "uppercase",
  },

  // ── Bottom ──
  bottom: {
    paddingBottom: 44,
    alignItems: "center",
    gap: 10,
  },
  loadingLabel: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.5,
  },
  barTrack: {
    width: width * 0.55,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: palette.gold,
    borderRadius: 2,
  },
  versionText: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.20)",
    letterSpacing: 1,
  },
});
