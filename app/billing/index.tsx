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
import { useTuitionStore } from "../../src/store/tuitionStore";

export default function MonthlyBillingScreen() {
  const { invoices } = useTuitionStore();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Tuition Invoices</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {invoices.map((inv) => (
          <TouchableOpacity
            key={inv.id}
            style={[styles.invoiceCard, inv.status === "DUE" && styles.invoiceDue]}
            onPress={() =>
              router.push({
                pathname: "/billing/[id]",
                params: { id: inv.id },
              })
            }
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.invNumber}>{inv.id}</Text>
                <Text style={styles.invPeriod}>{inv.billingPeriod}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  inv.status === "PAID" ? styles.statusPaid : styles.statusDue,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    inv.status === "PAID" ? { color: "#059669" } : { color: "#D97706" },
                  ]}
                >
                  {inv.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View>
                <Text style={styles.label}>Child & Subject</Text>
                <Text style={styles.val}>{inv.childName} · {inv.subject}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.label}>Monthly Fee</Text>
                <Text style={styles.amountVal}>₹{inv.amount.toLocaleString()}</Text>
              </View>
            </View>

            {inv.status === "DUE" && (
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() =>
                  router.push({
                    pathname: "/billing/[id]",
                    params: { id: inv.id },
                  })
                }
              >
                <Text style={styles.payNowText}>Pay Monthly Fee (₹{inv.amount})</Text>
              </TouchableOpacity>
            )}
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

  invoiceCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  invoiceDue: { borderColor: "#FDE68A", backgroundColor: "#FFFBEB" },

  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  invNumber: { fontSize: 14, fontFamily: fonts.bold, color: "#0D1B2A" },
  invPeriod: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusPaid: { backgroundColor: "#ECFDF5" },
  statusDue: { backgroundColor: "#FEF3C7" },
  statusText: { fontSize: 10, fontFamily: fonts.bold },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },

  detailsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B" },
  val: { fontSize: 13, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 2 },
  amountVal: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A", marginTop: 2 },

  payNowBtn: { marginTop: 14, backgroundColor: "#E8A838", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  payNowText: { color: "#0D1B2A", fontSize: 13, fontFamily: fonts.bold },
});
