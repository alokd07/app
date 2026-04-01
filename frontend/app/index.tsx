import React, { useEffect, useRef, memo, useCallback } from "react";
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
import { BlurView } from "expo-blur";
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
} from "react-native-reanimated";
import { isAuthenticated } from "../src/services/auth";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// ─── Brand Design System ─────────────────────────────────────────────────────
const brand = {
  colors: {
    navy: {
      900: "#020817",
      800: "#0F172A",
      700: "#1E293B",
    },
    gold: {
      DEFAULT: "#E8A838",
      light: "#F4C566",
      dark: "#B47C1C",
      glow: "rgba(232, 168, 56, 0.25)",
    },
    white: "#FFFFFF",
    muted: "rgba(255, 255, 255, 0.5)",
    subtle: "rgba(255, 255, 255, 0.1)",
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
    spring: { damping: 15, stiffness: 120, mass: 1 },
  },
};

// ─── Component: Animated Particle Background ─────────────────────────────────
const ParticleBackground = memo(() => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          entering={FadeIn.delay(p.delay * 1000)}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
            },
          ]}
        />
      ))}
    </View>
  );
});

ParticleBackground.displayName = "ParticleBackground";

// ─── Component: Premium "B" Logo with SVG-like Construction ──────────────────
const BrandLogo = memo(
  ({ animationProgress }: { animationProgress: SharedValue<number> }) => {
    const logoStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animationProgress.value,
        [0, 0.5, 1],
        [0.6, 1.1, 1],
      );
      const rotate = interpolate(animationProgress.value, [0, 1], [-10, 0]);
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
        [0, 1.5, 1],
      );
      const glowOpacity = interpolate(
        animationProgress.value,
        [0, 0.5, 1],
        [0, 0.3, 0.15],
      );

      return {
        transform: [{ scale: glowScale }],
        opacity: glowOpacity,
      };
    });

    return (
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Dynamic Glow Effect */}
        <Animated.View style={[styles.logoGlow, glowStyle]} />
        <Image
          source={require("../assets/images/Logo.png")}
          style={styles.logoCore}
        />

        {/* Signature Sparkle */}
        <Animated.View
          entering={ZoomIn.delay(600)}
          style={styles.sparkleContainer}
        >
          <View style={styles.sparkle} />
          <View style={[styles.sparkle, styles.sparklePulse]} />
        </Animated.View>
      </Animated.View>
    );
  },
);

BrandLogo.displayName = "BookMySessionLogo";

// ─── Component: Animated Loading Bar with Brand Personality ──────────────────
const BrandLoader = memo(({ progress }: { progress: SharedValue<number> }) => {
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor:
      progress.value >= 1 ? brand.colors.gold.light : brand.colors.gold.DEFAULT,
  }));

  const statusStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0.7, 1, 1, 0]),
    };
  });

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderTrack}>
        <Animated.View style={[styles.loaderBar, barStyle]} />
        {/* Shimmer Effect */}
        <View style={styles.loaderShimmer} />
      </View>

      <Animated.Text style={[styles.loaderText, statusStyle]}>
        {progress.value >= 1 ? "✓ READY" : "INITIALIZING SECURE GATEWAY"}
      </Animated.Text>
    </View>
  );
});

BrandLoader.displayName = "BrandLoader";

// ─── Main Splash Screen Component ────────────────────────────────────────────
export default function SplashScreen() {
  const logoProgress = useSharedValue(0);
  const contentProgress = useSharedValue(0);
  const loaderProgress = useSharedValue(0);
  const isTransitioning = useRef(false);

  const handleNavigation = useCallback(async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    // Haptic feedback for premium feel
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const authenticated = await isAuthenticated();
      // router.replace(authenticated ? "/(tabs)/home" : "/onboarding");
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/auth/login");
    }
  }, []);

  useEffect(() => {
    // Sequence animations for brand storytelling
    logoProgress.value = withSpring(1, {
      damping: 15,
      mass: 1,
      overshootClamping: false,
    });

    contentProgress.value = withDelay(
      300,
      withTiming(1, {
        duration: brand.animation.slow,
        easing: Easing.out(Easing.cubic),
      }),
    );

    loaderProgress.value = withDelay(
      600,
      withTiming(1, {
        duration: 2800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    );

    // Auto-advance after brand moment
    const timer = setTimeout(() => {
      runOnJS(handleNavigation)();
    }, 3800);

    return () => clearTimeout(timer);
  }, [handleNavigation, logoProgress, contentProgress, loaderProgress]);

  // Animated styles for content fade-in
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentProgress.value, [0, 0.5, 1], [0, 0.3, 1]),
    transform: [
      { translateY: interpolate(contentProgress.value, [0, 1], [30, 0]) },
    ],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentProgress.value, [0.7, 1], [0, 1]),
    transform: [
      { translateY: interpolate(contentProgress.value, [0.7, 1], [20, 0]) },
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

      {/* ── Layered Background ── */}
      <LinearGradient
        colors={[
          brand.colors.navy[900],
          brand.colors.navy[800],
          brand.colors.navy[700],
        ]}
        style={StyleSheet.absoluteFill}
      />

      <ParticleBackground />

      {/* Subtle Radial Gradient Overlay */}
      <View style={styles.radialOverlay} />

      {/* Brand Pattern Watermark */}
      <View style={styles.brandPattern} pointerEvents="none" />

      {/* ── Main Content ── */}
      <Animated.View style={[styles.content, contentStyle]}>
        <BrandLogo animationProgress={logoProgress} />

        <View style={styles.textBlock}>
          <Animated.Text
            entering={FadeInUp.delay(500).springify()}
            style={styles.brandName}
            accessible={true}
            accessibilityRole="header"
          >
            BOOKMY<Text style={styles.brandAccent}>SESSION</Text>
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(700)}
            style={styles.taglineContainer}
          >
            <View style={styles.taglineDivider} />
            <Text style={styles.tagline}>ELITE IN-PERSON EDUCATION</Text>
            <View style={styles.taglineDivider} />
          </Animated.View>

          {/* Brand Value Props */}
          <Animated.View
            entering={FadeInUp.delay(900)}
            style={styles.valueProps}
          >
            {["Quality Education", "Trusted Teachers", "Premium Experience"].map((prop, i) => (
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

        <BlurView intensity={20} tint="dark" style={styles.footerBadge}>
          <Text style={styles.copyright}>© {new Date().getFullYear()} BOOKMYSESSION.IN</Text>
          <View style={styles.secureBadge}>
            <Text style={styles.secureText}>🔒 SECURE</Text>
          </View>
        </BlurView>
      </Animated.View>

      {/* ── Completion Overlay (Optional) ── */}
      {/* {loaderProgress.value >= 1 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.completionOverlay}
          pointerEvents="none"
        >
          <Text style={styles.completionText}>Let&apos;s Begin</Text>
        </Animated.View>
      )} */}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.colors.navy[900],
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // Background Elements
  particle: {
    position: "absolute" as const,
    backgroundColor: "rgba(232, 168, 56, 0.6)",
    borderRadius: 999,
  },
  radialOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  brandPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },

  // Logo Styles
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: brand.spacing.xl,
  },
  logoGlow: {
    position: "absolute" as const,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: brand.colors.gold.glow,
  },
  logoCore: {
    width: 80,
    height: 80,
    position: "relative" as const,
  },
  logoStem: {
    position: "absolute" as const,
    left: 18,
    top: 12,
    width: 16,
    height: 56,
    borderRadius: 8,
    zIndex: 2,
  },
  logoCurve: {
    position: "absolute" as const,
    borderWidth: 14,
    borderRadius: 30,
    borderColor: "transparent",
  },
  logoCurveTop: {
    left: 18,
    top: 0,
    width: 54,
    height: 54,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: brand.colors.white,
    borderRightColor: brand.colors.white,
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
  logoCurveBottom: {
    left: 18,
    bottom: 0,
    width: 58,
    height: 58,
    borderLeftColor: "transparent",
    borderTopColor: "transparent",
    borderBottomColor: brand.colors.white,
    borderRightColor: brand.colors.white,
    transform: [{ rotate: "-45deg" }],
    opacity: 0.92,
    zIndex: 1,
  },
  logoAccent: {
    position: "absolute" as const,
    right: -2,
    top: "50%" as any,
    width: 24,
    height: 3,
    backgroundColor: brand.colors.gold.light,
    borderRadius: 2,
    transform: [{ rotate: "-15deg" }],
    zIndex: 3,
  },
  sparkleContainer: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    zIndex: 4,
  },
  sparkle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.colors.gold.light,
    transform: [{ rotate: "45deg" }],
  },
  sparklePulse: {
    position: "absolute" as const,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: brand.colors.gold.light,
    opacity: 0,
  },

  // Typography & Content
  content: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: brand.spacing.lg,
  },
  textBlock: {
    alignItems: "center" as const,
    maxWidth: width * 0.85,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900" as const,
    letterSpacing: -1.5,
    color: brand.colors.white,
    textAlign: "center" as const,
    fontFamily:
      Platform.OS === "ios"
        ? "HelveticaNeue-CondensedBlack"
        : "sans-serif-black",
  } as any,
  brandAccent: {
    color: brand.colors.gold.DEFAULT,
  },
  taglineContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: brand.spacing.md,
    gap: brand.spacing.sm,
  },
  taglineDivider: {
    width: 24,
    height: 1,
    backgroundColor: brand.colors.gold.DEFAULT,
    opacity: 0.6,
  },
  tagline: {
    fontSize: 9,
    fontWeight: "700" as const,
    letterSpacing: 3,
    color: brand.colors.muted,
  } as any,
  valueProps: {
    flexDirection: "row" as const,
    gap: brand.spacing.md,
    marginTop: brand.spacing.lg,
    flexWrap: "wrap" as const,
    justifyContent: "center" as const,
  },
  valueProp: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  } as any,

  // Footer & Loader
  footer: {
    position: "absolute" as const,
    bottom: brand.spacing.xl,
    width: "100%",
    alignItems: "center" as const,
    paddingHorizontal: brand.spacing.lg,
  },
  loaderContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center" as const,
    marginBottom: brand.spacing.lg,
  },
  loaderTrack: {
    width: "100%",
    height: 3,
    backgroundColor: brand.colors.subtle,
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  loaderBar: {
    height: "100%" as any,
    borderRadius: 2,
  },
  loaderShimmer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  loaderText: {
    fontSize: 9,
    fontWeight: "700" as const,
    letterSpacing: 3,
    color: brand.colors.muted,
    marginTop: brand.spacing.sm,
    textAlign: "center" as const,
  } as any,
  footerBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: brand.spacing.md,
    paddingHorizontal: brand.spacing.md,
    paddingVertical: brand.spacing.xs,
    borderRadius: 20,
    overflow: "hidden" as const,
  },
  copyright: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  } as any,
  secureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(232, 168, 56, 0.15)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(232, 168, 56, 0.3)",
  },
  secureText: {
    fontSize: 8,
    color: brand.colors.gold.light,
    fontWeight: "700" as const,
    letterSpacing: 1,
  } as any,

  // Completion Overlay
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 8, 23, 0.95)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 100,
  },
  completionText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: brand.colors.gold.DEFAULT,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  } as any,
});

// ─── Global Animations (Add to app.json or index.css for web) ───────────────
// For React Native, these would be handled via Reanimated or react-native-animatable
// For web support, add to your global styles:
/*
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
  50% { transform: translateY(-20px) translateX(5px); opacity: 1; }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
*/
