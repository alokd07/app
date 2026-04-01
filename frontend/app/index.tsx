import React, { useEffect, useRef, memo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  FadeInUp,
  FadeIn,
  ZoomIn,
  SharedValue,
  withRepeat,
  withSequence,
  useAnimatedReaction,
} from "react-native-reanimated";
import { isAuthenticated } from "../src/services/auth";
import * as Haptics from "expo-haptics";
import SafeBlurView from "../components/SafeBlurView";

const { width, height } = Dimensions.get("window");

// ─── Brand Design System (Expo-Optimized) ───────────────────────────────────
const brand = {
  colors: {
    navy: {
      950: "#010409",
      900: "#020817",
      850: "#0A1120",
      800: "#0F172A",
      700: "#1E293B",
    },
    gold: {
      DEFAULT: "#E8A838",
      light: "#F4C566",
      dark: "#B47C1C",
      glow: "rgba(232, 168, 56, 0.35)",
      gradient: ["#F4C566", "#E8A838", "#B47C1C"] as const,
    },
    white: "#FFFFFF",
    muted: "rgba(255, 255, 255, 0.5)",
    subtle: "rgba(255, 255, 255, 0.1)",
    accent: "rgba(232, 168, 56, 0.15)",
  },
  typography: {
    display: { fontSize: 36, fontWeight: "900", letterSpacing: -1.5 },
    headline: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    body: { fontSize: 14, fontWeight: "500", letterSpacing: 0.25 },
    micro: { fontSize: 9, fontWeight: "700", letterSpacing: 3 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64 },
  animation: {
    fast: 200,
    normal: 400,
    slow: 800,
    slower: 1200,
    spring: { damping: 18, stiffness: 140, mass: 0.9 },
    fluid: { easing: Easing.bezier(0.4, 0, 0.2, 1) },
  },
};

// ─── Abstract Geometry (Expo-Compatible) ────────────────────────────────────
const AbstractGeometry = memo(() => {
  const geom1 = useSharedValue(0);
  const geom2 = useSharedValue(0);
  const geom3 = useSharedValue(0);

  useEffect(() => {
    geom1.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    geom2.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
      -1,
      false,
    );
    geom3.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [geom1, geom2, geom3]);

  const geom1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(geom1.value, [0, 1], [-100, 100]) },
      { translateY: interpolate(geom1.value, [0, 1], [-50, 80]) },
      { rotate: `${interpolate(geom1.value, [0, 1], [0, 180])}deg` },
      { scale: interpolate(geom1.value, [0, 0.5, 1], [0.8, 1.2, 0.8]) },
    ],
    opacity: interpolate(
      geom1.value,
      [0, 0.3, 0.7, 1],
      [0.15, 0.25, 0.25, 0.15],
    ),
  }));

  const geom2Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(geom2.value, [0, 1], [width - 80, width - 200]),
      },
      {
        translateY: interpolate(
          geom2.value,
          [0, 1],
          [height * 0.3, height * 0.8],
        ),
      },
      { rotate: `${interpolate(geom2.value, [0, 1], [360, 0])}deg` },
      { scale: interpolate(geom2.value, [0, 0.5, 1], [1, 0.7, 1]) },
    ],
    opacity: interpolate(geom2.value, [0, 0.4, 0.6, 1], [0.1, 0.2, 0.2, 0.1]),
  }));

  const geom3Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          geom3.value,
          [0, 1],
          [width * 0.2, width * 0.8],
        ),
      },
      {
        translateY: interpolate(
          geom3.value,
          [0, 1],
          [height * 0.7, height * 0.2],
        ),
      },
      { rotate: `${interpolate(geom3.value, [0, 1], [-90, 90])}deg` },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Floating Diamond */}
      <Animated.View
        style={[
          styles.abstractShape,
          styles.diamond,
          { backgroundColor: brand.colors.gold.glow },
          geom1Style,
        ]}
      />

      {/* Floating Hexagon (CSS-only hex using border trick) */}
      <Animated.View
        style={[
          styles.abstractShape,
          styles.hexagon,
          { borderColor: brand.colors.gold.DEFAULT },
          geom2Style,
        ]}
      />

      {/* Floating Triangle */}
      <Animated.View
        style={[styles.abstractShape, styles.triangle, geom3Style]}
      />

      {/* Gradient Mesh Overlay */}
      <LinearGradient
        colors={[
          "transparent",
          brand.colors.accent,
          "transparent",
          brand.colors.gold.glow,
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.meshOverlay}
      />
    </View>
  );
});

// ─── Enhanced Mesh Background (Expo-Only) ───────────────────────────────────
const MeshBackground = memo(() => {
  const orb1Pos = useSharedValue(0);
  const orb2Pos = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    orb1Pos.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    orb2Pos.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000 }),
        withTiming(1, { duration: 2000 }),
      ),
      -1,
      false,
    );
  }, [orb1Pos, orb2Pos, pulse]);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb1Pos.value, [0, 1], [-80, 80]) },
      { translateY: interpolate(orb1Pos.value, [0, 1], [-40, 120]) },
      { scale: interpolate(orb1Pos.value, [0, 1], [1, 1.5]) },
      { rotate: `${interpolate(orb1Pos.value, [0, 1], [0, 25])}deg` },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          orb2Pos.value,
          [0, 1],
          [width - 100, width - 200],
        ),
      },
      {
        translateY: interpolate(
          orb2Pos.value,
          [0, 1],
          [height * 0.4, height * 0.8],
        ),
      },
      { scale: interpolate(orb2Pos.value, [0, 1], [1, 1.8]) },
      { rotate: `${interpolate(orb2Pos.value, [0, 1], [0, -30])}deg` },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.15], [0.25, 0.4]),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep Navy Gradient Base */}
      <LinearGradient
        colors={[
          brand.colors.navy[950],
          brand.colors.navy[900],
          brand.colors.navy[850],
          brand.colors.navy[800],
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Gradient Orbs */}
      <Animated.View style={[styles.meshOrb, styles.orbGold, orb1Style]}>
        <LinearGradient
          colors={brand.colors.gold.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.meshOrb, styles.orbNavy, orb2Style]}>
        <LinearGradient
          colors={[
            brand.colors.navy[700],
            brand.colors.navy[800],
            "transparent",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Pulsing Glow Center */}
      <Animated.View
        style={[
          styles.pulseGlow,
          pulseStyle,
          { backgroundColor: brand.colors.gold.glow },
        ]}
      />

      {/* Subtle Grid Pattern */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} style={styles.gridLineH} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`v-${i}`} style={styles.gridLineV} />
        ))}
      </View>

      {/* Abstract Geometry Layer */}
      <AbstractGeometry />

      {/* Glass Blur Overlay (Expo Blur) */}
      <SafeBlurView
        intensity={60}
        tint="dark"
        style={StyleSheet.absoluteFill}
        fallbackColor="rgba(2, 8, 23, 0.75)"
      />

      {/* Radial Vignette */}
      <View style={styles.vignette} />
    </View>
  );
});

//displayName for better debugging in React DevTools
MeshBackground.displayName = "MeshBackground";
AbstractGeometry.displayName = "AbstractGeometry";

// ─── Enhanced Particle System ───────────────────────────────────────────────
const ParticleBackground = memo(() => {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 4000 + 3000,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          entering={FadeIn.delay(p.delay * 800)}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              backgroundColor:
                Math.random() > 0.7
                  ? brand.colors.gold.light
                  : "rgba(255, 255, 255, 0.6)",
            },
          ]}
        />
      ))}
    </View>
  );
});

ParticleBackground.displayName = "ParticleBackground";

// ─── Premium Logo (Expo-Compatible - No MaskedView) ─────────────────────────
const BrandLogo = memo(
  ({ animationProgress }: { animationProgress: SharedValue<number> }) => {
    const haloProgress = useSharedValue(0);
    const orbitProgress = useSharedValue(0);
    const sweepProgress = useSharedValue(0);
    const sparkleProgress = useSharedValue(0);

    useEffect(() => {
      haloProgress.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.linear }),
        -1,
        false,
      );
      orbitProgress.value = withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.linear }),
        -1,
        false,
      );
      sweepProgress.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      sparkleProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 }),
        ),
        -1,
        false,
      );
    }, [haloProgress, orbitProgress, sweepProgress, sparkleProgress]);

    const logoStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animationProgress.value,
        [0, 0.5, 1],
        [0.5, 1.15, 1],
      );
      const rotate = interpolate(animationProgress.value, [0, 1], [-12, 0]);
      const opacity = interpolate(
        animationProgress.value,
        [0, 0.3, 1],
        [0, 1, 1],
      );

      return {
        transform: [{ scale }, { rotate: `${rotate}deg` }],
        opacity,
      };
    });

    const glowStyle = useAnimatedStyle(() => {
      const glowScale = interpolate(
        animationProgress.value,
        [0, 0.7, 1],
        [0, 1.8, 1.2],
      );
      const glowOpacity = interpolate(
        animationProgress.value,
        [0, 0.5, 1],
        [0, 0.45, 0.25],
      );

      return {
        transform: [{ scale: glowScale }],
        opacity: glowOpacity,
      };
    });

    const haloStyle = useAnimatedStyle(() => {
      const spin = interpolate(haloProgress.value, [0, 1], [0, 360]);
      const haloOpacity = interpolate(
        animationProgress.value,
        [0, 1],
        [0, 0.6],
      );
      const scale = interpolate(animationProgress.value, [0, 1], [0.8, 1]);

      return {
        opacity: haloOpacity,
        transform: [{ rotate: `${spin}deg` }, { scale }],
      };
    });

    const innerRingStyle = useAnimatedStyle(() => {
      const spin = interpolate(haloProgress.value, [0, 1], [360, 0]);
      const ringOpacity = interpolate(
        animationProgress.value,
        [0, 1],
        [0, 0.4],
      );

      return {
        opacity: ringOpacity,
        transform: [{ rotate: `${spin}deg` }],
      };
    });

    const orbitDotOneStyle = useAnimatedStyle(() => {
      const angle = interpolate(orbitProgress.value, [0, 1], [0, Math.PI * 2]);
      const radius = 65;
      return {
        transform: [
          { translateX: Math.cos(angle) * radius },
          { translateY: Math.sin(angle) * radius },
        ],
        opacity: interpolate(animationProgress.value, [0, 1], [0, 1]),
        scale: interpolate(sparkleProgress.value, [0, 0.5, 1], [1, 1.4, 1]),
      };
    });

    const orbitDotTwoStyle = useAnimatedStyle(() => {
      const angle = interpolate(
        orbitProgress.value,
        [0, 1],
        [Math.PI, Math.PI * 3],
      );
      const radius = 50;
      return {
        transform: [
          { translateX: Math.cos(angle) * radius },
          { translateY: Math.sin(angle) * radius },
        ],
        opacity: interpolate(animationProgress.value, [0, 1], [0, 0.85]),
      };
    });

    const sweepStyle = useAnimatedStyle(() => ({
      opacity: interpolate(animationProgress.value, [0, 1], [0, 0.55]),
      transform: [
        { translateX: interpolate(sweepProgress.value, [0, 1], [-100, 100]) },
        { rotate: "22deg" },
        {
          scaleY: interpolate(sweepProgress.value, [0, 0.5, 1], [0.3, 1, 0.3]),
        },
      ],
    }));

    const sparkleStyle = useAnimatedStyle(() => ({
      opacity: sparkleProgress.value,
      transform: [
        { scale: interpolate(sparkleProgress.value, [0, 1], [0.5, 1]) },
      ],
    }));

    return (
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Multi-layer Glow */}
        <Animated.View style={[styles.logoGlow, glowStyle]} />
        <Animated.View
          style={[
            styles.logoGlow,
            {
              ...styles.logoGlow,
              opacity: 0.3,
              transform: [{ scale: 1.3 }],
              backgroundColor: "rgba(232, 168, 56, 0.15)",
            },
          ]}
        />

        <Animated.View style={[styles.logoHalo, haloStyle]} />
        <Animated.View style={[styles.logoInnerHalo, innerRingStyle]} />

        {/* Orbiting Particles */}
        <Animated.View
          style={[styles.orbitDot, styles.orbitDotPrimary, orbitDotOneStyle]}
        />
        <Animated.View
          style={[styles.orbitDot, styles.orbitDotSecondary, orbitDotTwoStyle]}
        />

        {/* Logo Core with Rounded Container (Expo-compatible mask alternative) */}
        <View style={styles.logoImageMask}>
          <Image
            source={require("../assets/images/Logo.png")}
            style={styles.logoCore}
            resizeMode="contain"
          />
          <Animated.View style={[styles.logoSweep, sweepStyle]} />
        </View>

        {/* Signature Sparkle */}
        <Animated.View
          entering={ZoomIn.delay(500).springify()}
          style={styles.sparkleContainer}
        >
          <Animated.View style={[styles.sparkle, sparkleStyle]} />
          <View style={[styles.sparkle, styles.sparklePulse]} />
        </Animated.View>
      </Animated.View>
    );
  },
);

BrandLogo.displayName = "BookMySessionLogo";

// ─── Premium Loading Bar ────────────────────────────────────────────────────
const BrandLoader = memo(({ progress }: { progress: SharedValue<number> }) => {
  const [isReady, setIsReady] = useState(false);

  useAnimatedReaction(
    () => progress.value >= 1,
    (ready, prevReady) => {
      if (ready !== prevReady) {
        runOnJS(setIsReady)(ready);
      }
    },
    [progress],
  );

  const barStyle = useAnimatedStyle(() => {
    const widthPct = progress.value * 100;
    return {
      width: `${widthPct}%`,
      backgroundColor:
        progress.value >= 1
          ? brand.colors.gold.light
          : brand.colors.gold.DEFAULT,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-120, 260]) },
    ],
    opacity: interpolate(progress.value, [0, 0.1, 0.9, 1], [0, 0.4, 0.4, 0]),
  }));

  const statusStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0.7, 1, 1, 0]),
    transform: [{ scale: interpolate(progress.value, [0.9, 1], [1, 1.05]) }],
  }));

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderTrack}>
        <Animated.View style={[styles.loaderBar, barStyle]} />
        {/* Animated Shimmer */}
        <Animated.View style={[styles.loaderShimmer, shimmerStyle]} />
      </View>

      <Animated.Text style={[styles.loaderText, statusStyle]}>
        {isReady ? "✓ READY" : "INITIALIZING SECURE GATEWAY"}
      </Animated.Text>
    </View>
  );
});

BrandLoader.displayName = "BrandLoader";

// ─── Main Splash Screen (100% Expo Compatible) ──────────────────────────────
export default function SplashScreen() {
  const logoProgress = useSharedValue(0);
  const contentProgress = useSharedValue(0);
  const loaderProgress = useSharedValue(0);
  const isTransitioning = useRef(false);

  const handleNavigation = useCallback(async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const authenticated = await isAuthenticated();
      router.replace(authenticated ? "/(tabs)/home" : "/onboarding");
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/auth/login");
    }
  }, []);

  useEffect(() => {
    // Staggered brand animation sequence
    logoProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });

    contentProgress.value = withDelay(
      250,
      withTiming(1, {
        duration: brand.animation.slower,
        easing: Easing.out(Easing.cubic),
      }),
    );

    loaderProgress.value = withDelay(
      500,
      withTiming(1, {
        duration: 3200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    );

    const timer = setTimeout(() => {
      runOnJS(handleNavigation)();
    }, 4200);

    return () => clearTimeout(timer);
  }, [handleNavigation, logoProgress, contentProgress, loaderProgress]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentProgress.value, [0, 0.4, 1], [0, 0.2, 1]),
    transform: [
      { translateY: interpolate(contentProgress.value, [0, 1], [40, 0]) },
      { scale: interpolate(contentProgress.value, [0, 1], [0.98, 1]) },
    ],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentProgress.value, [0.6, 1], [0, 1]),
    transform: [
      { translateY: interpolate(contentProgress.value, [0.6, 1], [25, 0]) },
    ],
  }));

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Loading BookMySession"
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Layered Background - All Expo Compatible */}
      <MeshBackground />
      <ParticleBackground />
      <View style={styles.radialOverlay} />
      <View style={styles.brandPattern} pointerEvents="none" />

      {/* ── Main Content (TEXTS 100% PRESERVED) ── */}
      <Animated.View style={[styles.content, contentStyle]}>
        <BrandLogo animationProgress={logoProgress} />

        <View style={styles.textBlock}>
          <Animated.Text
            entering={FadeInUp.delay(450).springify()}
            style={styles.brandName}
            accessible={true}
            accessibilityRole="header"
          >
            BOOKMY<Text style={styles.brandAccent}>SESSION</Text>
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(650)}
            style={styles.taglineContainer}
          >
            <View style={styles.taglineDivider} />
            <Text style={styles.tagline}>ELITE IN-PERSON EDUCATION</Text>
            <View style={styles.taglineDivider} />
          </Animated.View>

          {/* Brand Value Props - Texts Exactly As-Is */}
          <Animated.View
            entering={FadeInUp.delay(850)}
            style={styles.valueProps}
          >
            {[
              "Quality Education",
              "Trusted Teachers",
              "Premium Experience",
            ].map((prop) => (
              <View key={prop} style={styles.valueProp}>
                <View style={styles.valuePropDot} />
                <Text style={styles.valuePropText}>{prop}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </Animated.View>

      {/* ── Footer / Loading State ── */}
      <Animated.View style={[styles.footer, footerStyle]}>
        <BrandLoader progress={loaderProgress} />

        <SafeBlurView
          intensity={25}
          tint="dark"
          style={styles.footerBadge}
          fallbackColor="rgba(2, 8, 23, 0.78)"
        >
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} BOOKMYSESSION.IN
          </Text>
          <View style={styles.secureBadge}>
            <Text style={styles.secureText}>🔒 SECURE</Text>
          </View>
        </SafeBlurView>
      </Animated.View>
    </View>
  );
}

// ─── Styles (Expo-Optimized) ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.colors.navy[900],
    alignItems: "center",
    justifyContent: "center",
  },

  // Background Elements
  particle: {
    position: "absolute",
    borderRadius: 999,
  },
  radialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,8,23,0.3)",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,4,9,0.6)",
  },
  brandPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
  },
  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },

  // Abstract Shapes (CSS-only, no external libs)
  abstractShape: {
    position: "absolute",
  },
  diamond: {
    width: 60,
    height: 60,
    borderRadius: 8,
    transform: [{ rotate: "45deg" }],
  },
  hexagon: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    transform: [{ rotate: "30deg" }],
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 43,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: brand.colors.gold.glow,
  },

  // Mesh Background Orbs
  meshOrb: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    opacity: 0.4,
  },
  orbGold: { top: -100, left: -60 },
  orbNavy: { bottom: -60, right: -60, opacity: 0.5 },
  pulseGlow: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    top: height * 0.5 - width * 0.6,
    left: width * 0.5 - width * 0.6,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-around",
    opacity: 0.05,
  },
  gridLineH: {
    width: "100%",
    height: 0.5,
    backgroundColor: brand.colors.gold.DEFAULT,
  },
  gridLineV: {
    height: "100%",
    width: 0.5,
    backgroundColor: brand.colors.gold.DEFAULT,
    position: "absolute",
    left: 0,
  },

  // Brand Logo
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    backgroundColor: brand.colors.gold.glow,
    borderRadius: 65,
  },
  logoHalo: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1.5,
    borderColor: "rgba(244, 197, 102, 0.55)",
  },
  logoInnerHalo: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderStyle: "dashed",
  },
  orbitDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  orbitDotPrimary: {
    backgroundColor: "rgba(244, 197, 102, 1)",
  },
  orbitDotSecondary: {
    width: 7,
    height: 7,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  logoImageMask: {
    width: 90,
    height: 90,
    borderRadius: 24,
    overflow: "hidden", // Native masking alternative
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logoCore: {
    width: 86,
    height: 86,
  },
  logoSweep: {
    position: "absolute",
    width: 30,
    height: 140,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  sparkleContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
  },
  sparkle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brand.colors.gold.light,
    transform: [{ rotate: "45deg" }],
  },
  sparklePulse: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: brand.colors.gold.light,
    opacity: 0,
  },

  // Content & Typography (TEXTS UNCHANGED)
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: brand.spacing.lg,
  },
  textBlock: {
    alignItems: "center",
    maxWidth: width * 0.9,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: brand.colors.white,
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios"
        ? "HelveticaNeue-CondensedBlack"
        : "sans-serif-black",
  },
  brandAccent: {
    color: brand.colors.gold.DEFAULT,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: brand.spacing.md,
    gap: brand.spacing.sm,
  },
  taglineDivider: {
    width: 24,
    height: 1,
    backgroundColor: brand.colors.gold.DEFAULT,
    opacity: 0.7,
  },
  tagline: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    color: brand.colors.muted,
  },
  valueProps: {
    flexDirection: "row",
    gap: brand.spacing.md,
    marginTop: brand.spacing.lg,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  valueProp: {
    flexDirection: "row",
    alignItems: "center",
    gap: brand.spacing.xs,
  },
  valuePropDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.colors.gold.DEFAULT,
  },
  valuePropText: {
    fontSize: 11,
    color: brand.colors.muted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Footer & Loader
  footer: {
    position: "absolute",
    bottom: brand.spacing.xl,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: brand.spacing.lg,
  },
  loaderContainer: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    marginBottom: brand.spacing.lg,
  },
  loaderTrack: {
    width: "100%",
    height: 4,
    backgroundColor: brand.colors.subtle,
    borderRadius: 3,
    overflow: "hidden",
  },
  loaderBar: {
    height: "100%",
    borderRadius: 3,
  },
  loaderShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.3)",
    width: "30%",
  },
  loaderText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    color: brand.colors.muted,
    marginTop: brand.spacing.sm,
    textAlign: "center",
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: brand.spacing.md,
    paddingHorizontal: brand.spacing.md,
    paddingVertical: brand.spacing.xs,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: brand.colors.subtle,
  },
  copyright: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  secureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "rgba(232, 168, 56, 0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232, 168, 56, 0.4)",
  },
  secureText: {
    fontSize: 8,
    color: brand.colors.gold.light,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
