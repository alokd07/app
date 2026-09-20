import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../src/theme/colors";
import { useTeacherStore } from "../src/store/teacherStore";
import { useUserStore } from "../src/store/userStore";

export default function FavoritesScreen() {
  const { favoriteTeacherIds, toggleFavoriteTeacher } = useUserStore();
  const { teachers } = useTeacherStore();

  const favoriteTeachers = teachers.filter((t) => favoriteTeacherIds.includes(t.id));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Teachers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {favoriteTeachers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No saved teachers yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any teacher's profile to save them to your favorites list.
            </Text>
            <TouchableOpacity
              style={styles.findBtn}
              onPress={() => router.push("/(tabs)/find-teacher")}
            >
              <Text style={styles.findText}>Find a Teacher</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favoriteTeachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={styles.teacherCard}
              onPress={() =>
                router.push({
                  pathname: "/teacher/[id]",
                  params: { id: teacher.id },
                })
              }
            >
              <Image source={{ uri: teacher.profileImage }} style={styles.avatar} />

              <View style={{ flex: 1 }}>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.subText}>{teacher.subjects.join(" · ")}</Text>
                <Text style={styles.priceText}>₹{teacher.pricePerHour}/hr · {teacher.rating} ★</Text>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => toggleFavoriteTeacher(teacher.id)}
              >
                <Ionicons name="heart" size={22} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  teacherCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  teacherName: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  subText: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  priceText: { fontSize: 13, fontFamily: fonts.bold, color: "#E8A838", marginTop: 2 },
  removeBtn: { padding: 8 },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B", textAlign: "center", marginTop: 4, paddingHorizontal: 20 },
  findBtn: { marginTop: 16, backgroundColor: "#0D1B2A", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  findText: { color: "#FFFFFF", fontSize: 13, fontFamily: fonts.bold },
});
