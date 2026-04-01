import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const palette = {
  navy: "#020817",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  white: "#FFFFFF",
  muted: "rgba(255, 255, 255, 0.5)",
  glass: "rgba(255, 255, 255, 0.06)",
};

const slides = [
  {
    id: "1",
    tag: "AI-POWERED MATCHING",
    title: "Precision Matching\nFor Better Learning",
    description:
      "Our AI analyzes your needs to find the one tutor who perfectly fits your learning style.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  },
  {
    id: "2",
    tag: "VERIFIED EXPERTS",
    title: "Safety & Quality\nIn Every Session",
    description:
      "Every tutor undergoes a 5-step verification process to ensure a secure environment.",
    image:
      "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800&q=80",
  },
  {
    id: "3",
    tag: "FLEXIBLE BOOKING",
    title: "Your Education,\nOn Your Schedule",
    description:
      "Book instant offline sessions or schedule in advance. Mastery is now on your terms.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },
];

// ─── Sub-Component: Pagination Dots ──────────────────────────────────────────
const Pagination = ({ scrollX }: { scrollX: Animated.Value }) => {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, i) => {
        // We interpolate SCALE instead of WIDTH
        const scaleXAnim = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [1, 2.5, 1], // 1x size to 2.5x size
          extrapolate: "clamp",
        });

        const opacityAnim = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: opacityAnim,
                transform: [{ scaleX: scaleXAnim }], // Use transform here
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace("/auth/login");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      {/* ── Background Parallax Image ── */}
      <View style={StyleSheet.absoluteFill}>
        {slides.map((slide, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0, 1, 0],
          });
          const scale = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [1.2, 1, 1.2],
          });
          return (
            <Animated.Image
              key={slide.id}
              source={{ uri: slide.image }}
              style={[
                StyleSheet.absoluteFill,
                { opacity, transform: [{ scale }] },
              ]}
              resizeMode="cover"
            />
          );
        })}
        <LinearGradient
          colors={["rgba(2,8,23,0.2)", "rgba(2,8,23,0.8)", palette.navy]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ── Content Slider ── */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index: i }) => {
          const translateY = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [100, 0, 100],
          });
          return (
            <View style={styles.slide}>
              <Animated.View
                style={[styles.contentCard, { transform: [{ translateY }] }]}
              >
                <View style={styles.glassTag}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      {/* ── Footer ── */}
      <SafeAreaView style={styles.footer}>
        <Pagination scrollX={scrollX} />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => router.replace("/auth/login")}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
            <LinearGradient
              colors={[palette.gold, palette.goldLight]}
              style={styles.nextButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>
                {index === slides.length - 1 ? "Get Started" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={palette.navy} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.navy },
  slide: {
    width,
    height,
    justifyContent: "flex-end",
    paddingBottom: height * 0.25,
  },

  // ── Content Card ──
  contentCard: {
    paddingHorizontal: 30,
    alignItems: "flex-start",
  },
  glassTag: {
    backgroundColor: palette.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  tagText: {
    color: palette.gold,
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 1.5,
  },
  title: {
    color: palette.white,
    fontSize: 32,
    fontFamily: "Manrope_800ExtraBold",
    lineHeight: 40,
    marginBottom: 15,
  },
  description: {
    color: palette.muted,
    fontSize: 15,
    fontFamily: "Manrope_400Regular",
    lineHeight: 24,
  },

  // ── Footer & Navigation ──
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 6,
    width: 8, // Fixed base width
    borderRadius: 2,
    backgroundColor: palette.gold,
    marginHorizontal: 4, // Added margin here to prevent dots overlapping when scaled
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    color: palette.muted,
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 16,
    gap: 10,
    shadowColor: palette.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: palette.navy,
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
  },
});
