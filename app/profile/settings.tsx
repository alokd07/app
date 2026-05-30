import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, appColors } from "@/src/theme/colors";

const P = appColors;

type SettingRow = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  type: "toggle" | "action";
  defaultOn?: boolean;
  onAction?: () => void;
};

const SETTINGS_GROUPS: { title: string; items: SettingRow[] }[] = [
  {
    title: "Notifications",
    items: [
      {
        id: "push",
        icon: "notifications-outline",
        label: "Push Notifications",
        sublabel: "Session reminders and updates",
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.1)",
        type: "toggle",
        defaultOn: true,
      },
      {
        id: "email_notif",
        icon: "mail-outline",
        label: "Email Notifications",
        sublabel: "Booking confirmations",
        color: "#6366F1",
        bg: "rgba(99,102,241,0.1)",
        type: "toggle",
        defaultOn: true,
      },
      {
        id: "sms",
        icon: "chatbubble-outline",
        label: "SMS Alerts",
        sublabel: "Critical alerts via SMS",
        color: "#10B981",
        bg: "rgba(16,185,129,0.1)",
        type: "toggle",
        defaultOn: false,
      },
    ],
  },
  {
    title: "Appearance",
    items: [
      {
        id: "dark_mode",
        icon: "moon-outline",
        label: "Dark Mode",
        sublabel: "Switch to dark theme",
        color: "#8B5CF6",
        bg: "rgba(139,92,246,0.1)",
        type: "toggle",
        defaultOn: false,
      },
      {
        id: "compact",
        icon: "reorder-four-outline",
        label: "Compact View",
        sublabel: "Show more content on screen",
        color: "#0EA5E9",
        bg: "rgba(14,165,233,0.1)",
        type: "toggle",
        defaultOn: false,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "change_pass",
        icon: "key-outline",
        label: "Change Password",
        sublabel: "Update your login password",
        color: "#E8A838",
        bg: "rgba(232,168,56,0.1)",
        type: "action",
        onAction: () => Alert.alert("Coming Soon", "Password change will be available soon."),
      },
      {
        id: "delete",
        icon: "trash-outline",
        label: "Delete Account",
        sublabel: "Permanently remove your data",
        color: "#EF4444",
        bg: "rgba(239,68,68,0.1)",
        type: "action",
        onAction: () =>
          Alert.alert(
            "Delete Account",
            "This action is irreversible. Please contact support to delete your account.",
            [{ text: "OK" }]
          ),
      },
    ],
  },
];

function SettingItem({ item }: { item: SettingRow }) {
  const [enabled, setEnabled] = useState(item.defaultOn ?? false);

  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => {
        if (item.type === "toggle") setEnabled(!enabled);
        else item.onAction?.();
      }}
      activeOpacity={item.type === "action" ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        <Text style={styles.settingSub}>{item.sublabel}</Text>
      </View>
      {item.type === "toggle" ? (
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: "#E5E7EB", true: `${P.gold}60` }}
          thumbColor={enabled ? P.gold : "#D1D5DB"}
          ios_backgroundColor="#E5E7EB"
        />
      ) : (
        <View style={styles.chevronBox}>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.settingCard}>
              {group.items.map((item, index) => (
                <View key={item.id}>
                  <SettingItem item={item} />
                  {index < group.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        <Text style={styles.versionHint}>BookMySession v1.0.4</Text>
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

  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  settingCard: {
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  settingContent: { flex: 1 },
  settingLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#1F2937",
  },
  settingSub: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#9CA3AF",
    marginTop: 2,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 74 },

  versionHint: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "#D1D5DB",
    marginTop: 28,
    marginBottom: 4,
  },
});
