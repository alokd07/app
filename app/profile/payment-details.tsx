import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useBookingStore } from "../../src/store/bookingStore";

export default function PaymentDetailsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { sessions } = useBookingStore();

  const session = sessions.find((s) => s.id === sessionId) || sessions[0];

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Receipt Downloaded",
      `Invoice receipt for booking ${session.id} has been saved to your downloads.`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Invoice & Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.receiptCard}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>BOOKMYSESSION</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PAID</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.val}>TXN-{session.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Booking Ref</Text>
            <Text style={styles.val}>{session.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tutor</Text>
            <Text style={styles.val}>{session.teacherName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Learner</Text>
            <Text style={styles.val}>{session.learnerName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Subject</Text>
            <Text style={styles.val}>{session.subject}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.val}>{session.date} ({session.timeSlot})</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Tuition Fee</Text>
            <Text style={styles.val}>₹{session.amountPaid}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Platform Convenience Fee</Text>
            <Text style={styles.val}>₹{session.platformFee}</Text>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount Paid</Text>
            <Text style={styles.totalVal}>₹{session.amountPaid + session.platformFee}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReceipt}>
          <Ionicons name="download-outline" size={20} color="#0D1B2A" />
          <Text style={styles.downloadText}>Download Official Receipt (PDF)</Text>
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
  receiptCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandText: { fontSize: 16, fontFamily: fonts.extraBold, color: "#0D1B2A", letterSpacing: 1 },
  paidBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  paidText: { fontSize: 11, fontFamily: fonts.bold, color: "#059669" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B" },
  val: { fontSize: 13, fontFamily: fonts.semiBold, color: "#0D1B2A" },
  totalLabel: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  totalVal: { fontSize: 18, fontFamily: fonts.bold, color: "#059669" },

  downloadBtn: { backgroundColor: "#E8A838", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, marginBottom: 20 },
  downloadText: { color: "#0D1B2A", fontSize: 15, fontFamily: fonts.bold },
});
