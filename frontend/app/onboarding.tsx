import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
  ImageBackground,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  white: "#FFFFFF",
  cream: "#FAF7F2",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#D9E2EE",
};

// ─── Slide Data ───────────────────────────────────────────────────────────────
interface Slide {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  accent: string; // overlay tint
}

const slides: Slide[] = [
  {
    id: "1",
    tag: "Progress Tracking",
    title: "Bringing Quality\nLearning to Every\nStudent",
    description:
      "Track your progress, master new skills, and stay ahead with powerful course tools.",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
    accent: "rgba(13,27,42,0.62)",
  },
  {
    id: "2",
    tag: "Expert Teachers",
    title: "Find the Right\nTeacher for\nEvery Subject",
    description:
      "Connect with qualified tutors and book sessions that perfectly fit your schedule.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    accent: "rgba(13,27,42,0.58)",
  },
  {
    id: "3",
    tag: "Learn Anywhere",
    title: "Study on Your\nTerms, At Your\nOwn Pace",
    description:
      "Access lessons online or offline — learning that moves with you, wherever you go.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    accent: "rgba(13,27,42,0.55)",
  },
];

// ─── Pill Tag ─────────────────────────────────────────────────────────────────
function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <View style={styles.tagDot} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

// ─── Single Slide ─────────────────────────────────────────────────────────────
function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: Slide;
  index: number;
  scrollX: Animated.Value;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const titleTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [60, 0, -60],
  });
  const titleOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
  });
  const descTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [80, 0, -80],
  });

  return (
    <View style={styles.slide}>
      {/* Full bleed image */}
      <ImageBackground
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Bottom-up gradient overlay */}
      <LinearGradient
        colors={["transparent", item.accent, palette.navy]}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content anchored to bottom */}
      <View style={styles.slideContent}>
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}
        >
          <Tag label={item.tag} />
          <Text style={styles.slideTitle}>{item.title}</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: descTranslate }],
          }}
        >
          <Text style={styles.slideDesc}>{item.description}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  // Entrance fade
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const isLast = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (!isLast) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/auth/login");
    }
  };

  const handleSkip = () => router.replace("/auth/login");

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
        style={{ opacity: fadeAnim }}
      />

      {/* ── Floating Footer ── */}
      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        {/* Dot pagination */}
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const dotScale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 3.5, 1], // ~8 → 28 visually
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [{ scaleX: dotScale }],
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Navigation row */}
        <View style={styles.navRow}>
          {/* Skip */}
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Next / Get Started */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleNext}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
              style={styles.nextBtn}
            >
              <LinearGradient
                colors={[palette.gold, "#D4922A"]}
                style={styles.nextGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextText}>
                  {isLast ? "Get Started" : "Next"}
                </Text>
                <View style={styles.nextArrow}>
                  <Ionicons
                    name={isLast ? "rocket-outline" : "arrow-forward"}
                    size={16}
                    color={palette.navy}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.navy,
  },

  // ── Slide ──
  slide: {
    width,
    height,
    justifyContent: "flex-end",
  },
  slideContent: {
    paddingHorizontal: 28,
    paddingBottom: 160,
    gap: 14,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(232,168,56,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(232,168,56,0.35)",
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.gold,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: palette.goldLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 36,
    fontFamily: "Manrope_700Bold",
    color: palette.white,
    lineHeight: 44,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  slideDesc: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
    maxWidth: width * 0.78,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.gold,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    color: "rgba(255,255,255,0.50)",
    letterSpacing: 0.2,
  },
  nextBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 24,
    paddingRight: 14,
    gap: 10,
  },
  nextText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.2,
  },
  nextArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(13,27,42,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});
