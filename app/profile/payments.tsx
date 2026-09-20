import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useUserStore } from "../../src/store/userStore";
import { useBookingStore } from "../../src/store/bookingStore";

export default function PaymentsScreen() {
  const { paymentMethods } = useUserStore();
  const { sessions } = useBookingStore();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Receipts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Saved Methods */}
        <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
        {paymentMethods.map((pm) => (
          <View key={pm.id} style={styles.pmCard}>
            <Ionicons name={pm.icon as any} size={24} color="#0D1B2A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.pmLabel}>{pm.label}</Text>
              <Text style={styles.pmDetails}>{pm.details}</Text>
            </View>
            {pm.isDefault && (
              <View style={styles.defaultPill}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            )}
          </View>
        ))}

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Transactions</Text>
        {sessions.map((sess) => (
          <TouchableOpacity
            key={sess.id}
            style={styles.txCard}
            onPress={() =>
              router.push({
                pathname: "/profile/payment-details",
                params: { sessionId: sess.id },
              })
            }
          >
            <View style={styles.txIconCircle}>
              <Ionicons name="receipt-outline" size={20} color="#059669" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{sess.subject} Lesson</Text>
              <Text style={styles.txSub}>
                Tutor: {sess.teacherName} · {sess.date}
              </Text>
              <Text style={styles.txIdText}>TXN ID: TXN-{sess.id}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.txAmount}>₹{sess.amountPaid}</Text>
              <Text style={styles.txStatus}>PAID</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  sectionTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  pmCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  pmLabel: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  pmDetails: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  defaultPill: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultText: { fontSize: 9, fontFamily: fonts.bold, color: "#059669" },

  txCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  txIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  txTitle: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  txSub: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },
  txIdText: { fontSize: 10, fontFamily: fonts.regular, color: "#94A3B8", marginTop: 2 },
  txAmount: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  txStatus: { fontSize: 10, fontFamily: fonts.bold, color: "#059669", marginTop: 2 },
});
