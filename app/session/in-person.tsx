import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";

export default function InPersonSessionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>In-Person Home Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.greenDot} />
            <Text style={styles.statusTitle}>TEACHER EN ROUTE</Text>
          </View>
          <Text style={styles.etaText}>Estimated Arrival: 03:50 PM (10 mins away)</Text>
        </View>

        {/* Mock Location Map */}
        <View style={styles.mapCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
            }}
            style={styles.mapImage}
          />
          <View style={styles.teacherPinOverlay}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
              }}
              style={styles.pinAvatar}
            />
            <Text style={styles.pinText}>Dr. Rajesh Verma</Text>
          </View>
        </View>

        {/* Address Info */}
        <View style={styles.addressBox}>
          <Ionicons name="location" size={20} color="#0D1B2A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.addrLabel}>Home Tuition Location</Text>
            <Text style={styles.addrFull}>
              B-42, Vasant Marg, Block B, Vasant Vihar, New Delhi - 110057
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() =>
            router.push({
              pathname: "/messages/[id]",
              params: { id: "conv-tch-2" },
            })
          }
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          <Text style={styles.contactText}>Message Tutor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  content: { flex: 1, padding: 20, justifyContent: "space-between" },
  statusCard: { backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#A7F3D0" },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#059669" },
  statusTitle: { fontSize: 11, fontFamily: fonts.extraBold, color: "#059669", letterSpacing: 0.5 },
  etaText: { fontSize: 15, fontFamily: fonts.bold, color: "#065F46" },

  mapCard: { flex: 1, borderRadius: 18, overflow: "hidden", marginVertical: 16, borderWidth: 1, borderColor: "#E2E8F0", position: "relative" },
  mapImage: { width: "100%", height: "100%" },
  teacherPinOverlay: { position: "absolute", top: "40%", left: "30%", backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 8, elevation: 6 },
  pinAvatar: { width: 28, height: 28, borderRadius: 14 },
  pinText: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },

  addressBox: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  addrLabel: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },
  addrFull: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },

  contactBtn: { backgroundColor: "#0D1B2A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  contactText: { color: "#FFFFFF", fontSize: 15, fontFamily: fonts.bold },
});
