import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "@/src/theme/colors";

const TRANSACTIONS = [
  {
    id: "1",
    title: "Physics – Session Booking",
    date: "28 May 2026",
    amount: "₹599",
    status: "Success",
    icon: "flask-outline",
    color: "#6366F1",
  },
  {
    id: "2",
    title: "Math – Session Booking",
    date: "21 May 2026",
    amount: "₹499",
    status: "Success",
    icon: "calculator-outline",
    color: "#10B981",
  },
  {
    id: "3",
    title: "Chemistry – Session Booking",
    date: "15 May 2026",
    amount: "₹649",
    status: "Refunded",
    icon: "beaker-outline",
    color: "#F59E0B",
  },
];

function TransactionCard({ item }: { item: (typeof TRANSACTIONS)[0] }) {
  const isRefunded = item.status === "Refunded";
  return (
    <View style={styles.txCard}>
      <View style={[styles.txIcon, { backgroundColor: `${item.color}18` }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.txContent}>
        <Text style={styles.txTitle}>{item.title}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.txAmount, isRefunded && styles.txAmountRefunded]}>
          {isRefunded ? `-${item.amount}` : item.amount}
        </Text>
        <View style={[styles.txBadge, isRefunded ? styles.txBadgeRefunded : styles.txBadgeSuccess]}>
          <Text style={[styles.txBadgeText, isRefunded ? { color: "#B45309" } : { color: "#065F46" }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function PaymentsScreen() {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Invoices</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Balance Card */}
        <View style={styles.balanceCardWrap}>
          <LinearGradient
            colors={["#020817", "#1A3050"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>Total Spent</Text>
                <Text style={styles.balanceAmount}>₹1,747</Text>
                <Text style={styles.balanceSub}>Across 3 sessions</Text>
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={28} color="#E8A838" />
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStats}>
              <View>
                <Text style={styles.balStatLab}>Sessions</Text>
                <Text style={styles.balStatVal}>12</Text>
              </View>
              <View style={styles.balStatDivider} />
              <View>
                <Text style={styles.balStatLab}>Pending</Text>
                <Text style={styles.balStatVal}>₹0</Text>
              </View>
              <View style={styles.balStatDivider} />
              <View>
                <Text style={styles.balStatLab}>Refunds</Text>
                <Text style={styles.balStatVal}>₹649</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.txList}>
            {TRANSACTIONS.map((item, index) => (
              <View key={item.id}>
                <TransactionCard item={item} />
                {index < TRANSACTIONS.length - 1 && (
                  <View style={styles.txDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Saved Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          <TouchableOpacity style={styles.addCardBtn} activeOpacity={0.7}>
            <View style={styles.addCardIcon}>
              <Ionicons name="add" size={22} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addCardTitle}>Add New Card</Text>
              <Text style={styles.addCardSubtitle}>Credit, debit or UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },

  scroll: { paddingBottom: 60 },

  // Balance Card
  balanceCardWrap: { padding: 18, paddingBottom: 6 },
  balanceCard: {
    borderRadius: 24,
    padding: 22,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: 34,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
    marginTop: 4,
  },
  balanceSub: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  walletIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(232,168,56,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 18,
  },
  balanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  balStatLab: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  balStatVal: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 4,
  },
  balStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Sections
  section: { paddingHorizontal: 18, marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Transactions
  txList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  txContent: { flex: 1 },
  txTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  txDate: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: "#1F2937",
  },
  txAmountRefunded: { color: "#D97706" },
  txBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  txBadgeSuccess: { backgroundColor: "rgba(16,185,129,0.1)" },
  txBadgeRefunded: { backgroundColor: "rgba(245,158,11,0.1)" },
  txBadgeText: { fontSize: 11, fontFamily: fonts.bold },
  txDivider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 74 },

  // Add card
  addCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  addCardTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  addCardSubtitle: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
