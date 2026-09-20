import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useTuitionStore } from "../../src/store/tuitionStore";

export default function BillDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, payMonthlyBill } = useTuitionStore();

  const invoice = invoices.find((i) => i.id === id) || invoices[0];
  const [selectedMethod, setSelectedMethod] = useState("upi");

  const handlePay = () => {
    payMonthlyBill(invoice.id);
    Alert.alert(
      "Payment Successful!",
      `₹${invoice.amount} paid successfully for ${invoice.billingPeriod}. Tuition continues active.`,
      [{ text: "View Receipt", onPress: () => router.replace("/(tabs)/tuition") }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuition Bill & Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Bill Breakdown Card */}
        <View style={styles.invoiceCard}>
          <Text style={styles.invTitle}>Monthly Tuition Invoice</Text>
          <Text style={styles.invId}>{invoice.id}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Child</Text>
            <Text style={styles.val}>{invoice.childName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tutor</Text>
            <Text style={styles.val}>{invoice.teacherName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Subject</Text>
            <Text style={styles.val}>{invoice.subject}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Billing Period</Text>
            <Text style={styles.val}>{invoice.billingPeriod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Classes Billed</Text>
            <Text style={styles.val}>{invoice.totalClassesScheduled} classes</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount Due</Text>
            <Text style={styles.totalVal}>₹{invoice.amount.toLocaleString()}</Text>
          </View>
        </View>

        {invoice.status === "DUE" ? (
          <>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>

            {[
              { id: "upi", name: "Google Pay / PhonePe UPI", icon: "logo-google" },
              { id: "card", name: "Credit / Debit Card", icon: "card" },
              { id: "netbanking", name: "Net Banking", icon: "briefcase" },
            ].map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.pmRow, isSelected && styles.pmRowSelected]}
                  onPress={() => setSelectedMethod(m.id)}
                >
                  <Ionicons name={m.icon as any} size={20} color="#0D1B2A" />
                  <Text style={styles.pmText}>{m.name}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#0D1B2A" />
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <View style={styles.paidNotice}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text style={styles.paidNoticeText}>
              This bill was paid on {invoice.paidOnDate || "Sep 15, 2026"}.
            </Text>
          </View>
        )}
      </ScrollView>

      {invoice.status === "DUE" && (
        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
            <Text style={styles.payBtnText}>Pay Monthly Fee (₹{invoice.amount})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },

  invoiceCard: { backgroundColor: "#FFFFFF", padding: 18, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
  invTitle: { fontSize: 16, fontFamily: fonts.bold, color: "#0D1B2A" },
  invId: { fontSize: 12, fontFamily: fonts.medium, color: "#64748B", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  label: { fontSize: 13, fontFamily: fonts.regular, color: "#64748B" },
  val: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A" },
  totalLabel: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  totalVal: { fontSize: 20, fontFamily: fonts.bold, color: "#059669" },

  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 12 },
  pmRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  pmRowSelected: { borderColor: "#0D1B2A", backgroundColor: "#F8F9FA" },
  pmText: { flex: 1, fontSize: 14, fontFamily: fonts.medium, color: "#0D1B2A" },

  paidNotice: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#ECFDF5", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#A7F3D0" },
  paidNoticeText: { fontSize: 14, fontFamily: fonts.bold, color: "#065F46" },

  footerBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  payBtn: { backgroundColor: "#E8A838", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  payBtnText: { color: "#0D1B2A", fontSize: 16, fontFamily: fonts.bold },
});
