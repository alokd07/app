import React, { useState } from "react";
import {
  Linking,
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
import { fonts } from "@/src/theme/colors";
import * as WebBrowser from "expo-web-browser";
import apiClient from "@/src/services/api";
import { API_CONFIG } from "@/src/config/api";

const FAQS = [
  {
    id: "1",
    question: "How do I book a session?",
    answer:
      "Go to the Home tab, search for a subject or teacher, and tap 'Book Session'. Choose a time slot and confirm payment to complete your booking.",
  },
  {
    id: "2",
    question: "Can I reschedule a session?",
    answer:
      "Yes! You can reschedule up to 24 hours before the session. Go to Bookings tab, select the session, and tap 'Reschedule'.",
  },
  {
    id: "3",
    question: "What if a teacher cancels?",
    answer:
      "If a teacher cancels, you'll receive a full refund to your original payment method within 3–5 business days.",
  },
  {
    id: "4",
    question: "How do I update my profile?",
    answer:
      "Go to Profile > Personal Details, Contact & Address, or Education Details to update any information.",
  },
  {
    id: "5",
    question: "Is my payment information safe?",
    answer:
      "Yes, all payments are processed through secure, PCI-DSS compliant payment gateways. We do not store card details.",
  },
];

function FAQItem({ item }: { item: (typeof FAQS)[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </View>
  );
}

export default function HelpScreen() {
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset" size={32} color="#14B8A6" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Browse FAQs or reach out — we're here for you!
          </Text>
        </View>

        {/* Contact options */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: "rgba(20,184,166,0.07)" }]}
            onPress={() => Linking.openURL("mailto:support@bookmysession.in")}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={24} color="#14B8A6" />
            <Text style={[styles.contactLabel, { color: "#0F766E" }]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: "rgba(37,211,102,0.07)" }]}
            onPress={() => Linking.openURL("https://wa.me/919999999999")}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={[styles.contactLabel, { color: "#15803D" }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: "rgba(99,102,241,0.07)" }]}
            onPress={() =>
              WebBrowser.openBrowserAsync("https://www.bookmysession.in/support")
            }
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={24} color="#6366F1" />
            <Text style={[styles.contactLabel, { color: "#4338CA" }]}>Web</Text>
          </TouchableOpacity>
        </View>

        {/* Raise Ticket Action */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <TouchableOpacity
            style={styles.raiseTicketBtn}
            onPress={async () => {
              try {
                const res = await apiClient.post(API_CONFIG.ENDPOINTS.SUPPORT_TICKET, {
                  subject: "Help Request",
                  category: "General Inquiry",
                  message: "Student requested support via app help screen",
                });
                alert(res.data?.message || "Support ticket created successfully!");
              } catch (e) {
                alert("Failed to submit support request. Please try again.");
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
            <Text style={styles.raiseTicketText}>Raise a Support Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQS.map((item, index) => (
              <View key={item.id}>
                <FAQItem item={item} />
                {index < FAQS.length - 1 && (
                  <View style={styles.faqDivider} />
                )}
              </View>
            ))}
          </View>
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

  heroCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    margin: 18,
    borderRadius: 24,
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
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "rgba(20,184,166,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },

  contactRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  contactCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  contactLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  section: { paddingHorizontal: 18, marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  faqList: {
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
  faqItem: { padding: 16 },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#1F2937",
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 10,
    paddingRight: 24,
  },
  faqDivider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
  raiseTicketBtn: {
    backgroundColor: "#14B8A6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  raiseTicketText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
