import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../src/services/api";
import { API_CONFIG } from "../../src/config/api";
import { removeToken, getUserData } from "../../src/services/auth";
import { useAuthStore } from "../../src/store/authStore";
import { User } from "../../src/types";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldPale: "rgba(232,168,56,0.10)",
  goldBorder: "rgba(232,168,56,0.25)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  border: "#E4EAF2",
  inputBg: "#F4F7FB",
  success: "#27AE60",
  successPale: "rgba(39,174,96,0.10)",
  error: "#E05252",
  errorPale: "rgba(224,82,82,0.10)",
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { logout: storeLogout } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PROFILE);
      if (response.data.data) {
        setUser(response.data.data);
        setName(response.data.data.name || "");
        setEmail(response.data.data.email || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Try to get cached user data
      const cachedUser = await getUserData();
      if (cachedUser) {
        setUser(cachedUser);
        setName(cachedUser.name || "");
        setEmail(cachedUser.email || "");
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.USER_PROFILE,
        {
          name,
          email,
        },
      );

      if (response.data.data) {
        setUser(response.data.data);
        setEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          storeLogout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={palette.navy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.avatarSection}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={56} color={palette.gold} />
              </View>
            )}
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!editing && (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={styles.editBtn}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={palette.gold}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.fieldsContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={palette.muted}
                />
              ) : (
                <View style={styles.displayValue}>
                  <Text style={styles.value}>{name || "Not provided"}</Text>
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={palette.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <View style={styles.displayValue}>
                  <Text style={styles.value}>{email || "Not provided"}</Text>
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.displayValue}>
                <Text style={styles.value}>
                  {user?.phone || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {editing && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  setName(user?.name || "");
                  setEmail(user?.email || "");
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={palette.navy} />
                ) : (
                  <LinearGradient
                    colors={[palette.gold, palette.goldLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGrad}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={palette.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: palette.cream,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: palette.white,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    letterSpacing: -0.3,
  },
  avatarSection: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: palette.gold,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: palette.goldPale,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: palette.goldBorder,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  userPhone: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: palette.muted,
  },
  section: {
    backgroundColor: palette.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    letterSpacing: -0.2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.goldPale,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.goldBorder,
  },
  fieldsContainer: {
    gap: 16,
  },
  field: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: palette.muted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  displayValue: {
    backgroundColor: palette.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  value: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: palette.ink,
  },
  input: {
    backgroundColor: palette.inputBg,
    borderWidth: 1.5,
    borderColor: palette.gold,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: palette.ink,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.ink,
    letterSpacing: 0.2,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveBtnGrad: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: palette.navy,
    letterSpacing: 0.2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: palette.errorPale,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: palette.error,
    letterSpacing: 0.2,
  },
});
