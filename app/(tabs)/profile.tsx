import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData, removeToken, saveUserData } from "@/src/services/auth";
import Avatar from "@/components/Avatar";
import * as WebBrowser from "expo-web-browser";
import * as ImagePicker from "expo-image-picker";
import { appColors, fonts } from "../../src/theme/colors";
import { useAuthStore } from "@/src/store/authStore";
import apiClient from "@/src/services/api";
import { API_CONFIG } from "@/src/config/api";
import Loader from "@/components/Loader";

const P = {
  ...appColors,
  navy: appColors.midnight,
  navyMid: appColors.midnightMid,
  muted: appColors.mutedSlate,
  success: appColors.successAlt,
  border: appColors.goldBorder,
  goldSoft: appColors.goldSoft,
  glass: appColors.glassStrong,
};

type ProfileForm = {
  imageUrl?: string;
  firstName: string;
  lastName: string;
  DOB: string;
  gender: string;
  phoneNumber: string;
  houseNumber: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  schoolName: string;
  schoolAddress: string;
};

type ProfileSection =
  | "Personal Details"
  | "Address Details"
  | "Education Details";

type ProfileField = {
  key: keyof ProfileForm;
  label: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
  placeholder?: string;
};

type SectionConfig = {
  key: ProfileSection;
  summaryTitle: string;
  fields: ProfileField[];
};

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "Personal Details",
    summaryTitle: "Personal Details",
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "DOB", label: "Date of Birth", placeholder: "YYYY-MM-DD" },
      { key: "gender", label: "Gender" },
    ],
  },
  {
    key: "Address Details",
    summaryTitle: "Address Details",
    fields: [
      { key: "houseNumber", label: "House / Flat No." },
      { key: "area", label: "Area / Locality" },
      { key: "landmark", label: "Landmark" },
      { key: "pincode", label: "Pincode", keyboardType: "number-pad" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
    ],
  },
  {
    key: "Education Details",
    summaryTitle: "Education Details",
    fields: [
      { key: "schoolName", label: "School Name" },
      {
        key: "schoolAddress",
        label: "School Address",
        multiline: true,
        placeholder: "Enter school address",
      },
    ],
  },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const EMPTY_PROFILE: ProfileForm = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  DOB: "",
  gender: "",
  phoneNumber: "",
  houseNumber: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  country: "India",
  schoolName: "",
  schoolAddress: "",
};

function SettingsLink({ icon, label, sublabel, danger, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={18} color={danger ? "#EF4444" : P.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuText, danger && { color: "#EF4444" }]}>
          {label}
        </Text>
        {sublabel && <Text style={styles.menuSubtext}>{sublabel}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color={P.muted} />}
    </TouchableOpacity>
  );
}

function FieldCard({
  title,
  fields,
  format,
  onEdit,
}: {
  title: ProfileSection;
  fields: ProfileField[];
  format: (field: ProfileField) => string;
  onEdit: () => void;
}) {
  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.sectionEditBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={14} color={P.navy} />
          <Text style={styles.sectionEditText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoCard}>
        {fields.map((field, index) => (
          <View key={field.key}>
            <View style={styles.detailRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{field.label}</Text>
                <Text style={styles.detailValue}>{format(field)}</Text>
              </View>
            </View>
            {index !== fields.length - 1 && <View style={styles.hDivider} />}
          </View>
        ))}
      </View>
    </>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState<ProfileForm>(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(
    null,
  );
  const [draftValues, setDraftValues] = useState<Partial<ProfileForm>>({});
  const { setAuthenticated, setUser: setAuthUser } = useAuthStore();

  const fullName = useMemo(() => {
    const parts = [user.firstName, user.lastName]
      .map((part) => part?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Student";
  }, [user.firstName, user.lastName]);

  const loadUser = async () => {
    const storedUser = await getUserData();
    const normalizedUser =
      storedUser?.student ??
      storedUser?.data?.student ??
      storedUser?.data ??
      storedUser ??
      {};

    setUser({
      ...EMPTY_PROFILE,
      ...normalizedUser,
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const getSectionFields = (section: ProfileSection) =>
    SECTION_CONFIGS.find((config) => config.key === section)?.fields ?? [];

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "Phone Number";

    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      const first = digits.slice(2, 7);
      const second = digits.slice(7, 12);
      return `+91 ${first} ${second}`;
    }

    return phone;
  };

  const formatFieldValue = (field: ProfileField) => {
    const rawValue = user[field.key];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (!value) {
      return field.key === "country" ? "India" : "Not provided";
    }

    if (field.key === "phoneNumber") {
      return formatPhoneNumber(value);
    }

    return value;
  };

  const openSectionSheet = (section: ProfileSection) => {
    setActiveSection(section);
    const nextDraft: Partial<ProfileForm> = {};

    getSectionFields(section).forEach((field) => {
      nextDraft[field.key] = user[field.key] ?? "";
    });

    if (section === "Address Details" && !nextDraft.country) {
      nextDraft.country = "India";
    }

    setDraftValues(nextDraft);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    if (isSaving) {
      return;
    }

    setSheetVisible(false);
    setActiveSection(null);
    setDraftValues({});
  };

  const validateSectionValues = (
    section: ProfileSection,
    values: Partial<ProfileForm>,
  ) => {
    const requiredKeys: (keyof ProfileForm)[] =
      section === "Personal Details"
        ? ["firstName", "lastName", "DOB", "gender"]
        : section === "Address Details"
          ? ["houseNumber", "area", "pincode", "city", "state", "country"]
          : ["schoolName"];

    for (const key of requiredKeys) {
      const value = (values[key] ?? "").trim();
      if (!value) {
        const field = getSectionFields(section).find(
          (item) => item.key === key,
        );
        return `${field?.label || "This field"} is required.`;
      }
    }

    const pincode = (values.pincode ?? "").trim();
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return "Pincode must be exactly 6 digits.";
    }

    const dob = (values.DOB ?? "").trim();
    if (dob) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        return "DOB must be in YYYY-MM-DD format.";
      }
      const parsedDate = new Date(dob);
      if (Number.isNaN(parsedDate.getTime())) {
        return "Please enter a valid DOB.";
      }
    }

    return null;
  };

  const updateDraftValue = (key: keyof ProfileForm, value: string) => {
    setDraftValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleUpdateSection = async () => {
    if (!activeSection) {
      return;
    }

    const validationError = validateSectionValues(activeSection, draftValues);
    if (validationError) {
      Alert.alert("Invalid value", validationError);
      return;
    }

    const fields = getSectionFields(activeSection);
    const payload = fields.reduce((acc, field) => {
      const value = (draftValues[field.key] ?? "").trim();
      acc[field.key] =
        field.key === "landmark" ? value || "Not provided" : value;
      return acc;
    }, {} as Partial<ProfileForm>);

    setIsSaving(true);
    try {
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.UPDATE_STUDENT_PROFILE,
        payload,
      );

      const updatedStudent =
        response?.data?.data?.student ?? response?.data?.student ?? null;

      const nextUser = {
        ...user,
        ...(updatedStudent || payload),
      } as ProfileForm;

      setUser(nextUser);
      await saveUserData(nextUser);
      setAuthUser(nextUser as any);
      closeSheet();
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        error?.response?.data?.message || "Unable to update profile right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpdate = async () => {
    if (isSaving) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to update profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedUri = result.assets[0].uri;
    const selectedImage = result.assets[0];

    const formData = new FormData();

    formData.append("image", {
      uri: selectedImage.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    setIsSaving(true);
    try {
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.UPDATE_STUDENT_PROFILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Image update response:", response.data.data.student);

      const updatedStudent =
        response?.data?.data?.student ?? response?.data?.student ?? null;

      const nextUser = {
        ...user,
        ...(updatedStudent || { imageUrl: selectedUri }),
      } as ProfileForm;

      setUser(nextUser);
      await saveUserData(nextUser);
      const currentStoreUser = useAuthStore.getState().user as any;
      setAuthUser({
        ...currentStoreUser,
        ...nextUser,
        imageUrl: nextUser.imageUrl || selectedUri,
      } as any);
    } catch (error: any) {
      Alert.alert(
        "Image update failed",
        error?.response?.data?.message ||
          "Unable to update profile picture right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  async function handleSignOut() {
    await removeToken();
    setAuthenticated(false);
    router.replace("/auth/login");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Loader visible={isSaving} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[P.navy, P.navyMid]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
              <View style={styles.progressRing} />
              <Avatar
                uri={user.imageUrl}
                name={user.firstName || "Student"}
                size={84}
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleProfileImageUpdate}
                disabled={isSaving}
              >
                <Ionicons name="camera" size={14} color={P.navy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{fullName}</Text>
            <View style={styles.rankPill}>
              <Ionicons name="ribbon" size={12} color={P.gold} />
              <Text style={styles.rankText}>GOLD STUDENT</Text>
            </View>
          </View>

          <View style={styles.glassStats}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLab}>SESSIONS</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>4.9</Text>
              <Text style={styles.statLab}>RATING</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>8</Text>
              <Text style={styles.statLab}>COURSES</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {SECTION_CONFIGS.map((section, index) => (
            <View
              key={section.key}
              style={index > 0 ? { marginTop: 25 } : undefined}
            >
              <FieldCard
                title={section.key}
                fields={section.fields}
                format={formatFieldValue}
                onEdit={() => openSectionSheet(section.key)}
              />
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>
            Preferences
          </Text>
          <View style={styles.settingsCard}>
            <SettingsLink
              icon="notifications-outline"
              label="Notifications"
              sublabel="Alerts, sounds, reminders"
              onPress={() => router.push("/notifications")}
            />
            <View style={styles.hDivider} />
            <SettingsLink
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              sublabel="Password, data usage"
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  "https://www.bookmysession.in/privacy-policy",
                );
              }}
            />
            <View style={styles.hDivider} />
            <SettingsLink
              icon="wallet-outline"
              label="Payments"
              sublabel="Invoices, saved cards"
            />
          </View>

          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>BookMySession • v1.0.4</Text>
        </View>
      </ScrollView>

      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetKeyboardAvoiding}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                {activeSection || "Edit Details"}
              </Text>

              {activeSection && activeSection !== "Education Details" && (
                <View style={{ gap: 12 }}>
                  {activeSection === "Personal Details" && (
                    <View style={{ gap: 12 }}>
                      <View style={styles.rowPair}>
                        <TextInput
                          style={[styles.sheetInput, styles.sheetHalfInput]}
                          value={draftValues.firstName ?? ""}
                          onChangeText={(value) =>
                            updateDraftValue("firstName", value)
                          }
                          editable={!isSaving}
                          placeholder="First Name"
                          placeholderTextColor={P.muted}
                        />
                        <TextInput
                          style={[styles.sheetInput, styles.sheetHalfInput]}
                          value={draftValues.lastName ?? ""}
                          onChangeText={(value) =>
                            updateDraftValue("lastName", value)
                          }
                          editable={!isSaving}
                          placeholder="Last Name"
                          placeholderTextColor={P.muted}
                        />
                      </View>
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.DOB ?? ""}
                        onChangeText={(value) => updateDraftValue("DOB", value)}
                        editable={!isSaving}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={P.muted}
                      />
                      <View style={styles.genderOptionsRow}>
                        {GENDER_OPTIONS.map((option) => {
                          const active = draftValues.gender === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.genderOption,
                                active && styles.genderOptionActive,
                              ]}
                              onPress={() => updateDraftValue("gender", option)}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.genderOptionText,
                                  active && styles.genderOptionTextActive,
                                ]}
                              >
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <View style={styles.sheetInfoBox}>
                        <Text style={styles.sheetInfoText}>
                          Phone number is locked because it is verified through
                          OTP.
                        </Text>
                        <Text style={styles.sheetLockedValue}>
                          {formatPhoneNumber(
                            draftValues.phoneNumber ?? user.phoneNumber,
                          )}
                        </Text>
                      </View>
                    </View>
                  )}

                  {activeSection === "Address Details" && (
                    <View style={{ gap: 12 }}>
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.houseNumber ?? ""}
                        onChangeText={(value) =>
                          updateDraftValue("houseNumber", value)
                        }
                        editable={!isSaving}
                        placeholder="House / Flat No."
                        placeholderTextColor={P.muted}
                      />
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.area ?? ""}
                        onChangeText={(value) =>
                          updateDraftValue("area", value)
                        }
                        editable={!isSaving}
                        placeholder="Area / Locality"
                        placeholderTextColor={P.muted}
                      />
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.landmark ?? ""}
                        onChangeText={(value) =>
                          updateDraftValue("landmark", value)
                        }
                        editable={!isSaving}
                        placeholder="Landmark"
                        placeholderTextColor={P.muted}
                      />
                      <View style={styles.rowPair}>
                        <TextInput
                          style={[styles.sheetInput, styles.sheetHalfInput]}
                          value={draftValues.pincode ?? ""}
                          onChangeText={(value) =>
                            updateDraftValue(
                              "pincode",
                              value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          editable={!isSaving}
                          keyboardType="number-pad"
                          placeholder="Pincode"
                          placeholderTextColor={P.muted}
                        />
                        <TextInput
                          style={[styles.sheetInput, styles.sheetHalfInput]}
                          value={draftValues.city ?? ""}
                          onChangeText={(value) =>
                            updateDraftValue("city", value)
                          }
                          editable={!isSaving}
                          placeholder="City"
                          placeholderTextColor={P.muted}
                        />
                      </View>
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.state ?? ""}
                        onChangeText={(value) =>
                          updateDraftValue("state", value)
                        }
                        editable={!isSaving}
                        placeholder="State"
                        placeholderTextColor={P.muted}
                      />
                      <TextInput
                        style={styles.sheetInput}
                        value={draftValues.country ?? ""}
                        onChangeText={(value) =>
                          updateDraftValue("country", value)
                        }
                        editable={!isSaving}
                        placeholder="Country"
                        placeholderTextColor={P.muted}
                      />
                    </View>
                  )}
                </View>
              )}

              {activeSection === "Education Details" && (
                <View style={{ gap: 12 }}>
                  <TextInput
                    style={styles.sheetInput}
                    value={draftValues.schoolName ?? ""}
                    onChangeText={(value) =>
                      updateDraftValue("schoolName", value)
                    }
                    editable={!isSaving}
                    placeholder="School Name"
                    placeholderTextColor={P.muted}
                  />
                  <TextInput
                    style={[styles.sheetInput, styles.sheetInputMultiline]}
                    value={draftValues.schoolAddress ?? ""}
                    onChangeText={(value) =>
                      updateDraftValue("schoolAddress", value)
                    }
                    editable={!isSaving}
                    placeholder="School Address"
                    placeholderTextColor={P.muted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={handleUpdateSection}
                style={styles.sheetSaveBtn}
                activeOpacity={0.85}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={P.navy} />
                ) : (
                  <Text style={styles.sheetSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  heroSection: {
    height: 340,
    paddingHorizontal: 25,
    paddingTop: 20,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },

  profileInfo: { alignItems: "center", marginTop: 15 },
  avatarWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: P.gold,
    borderRightColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.gold,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: P.navy,
  },
  userName: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: P.white,
    marginTop: 15,
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232, 168, 56, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  rankText: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
    color: P.gold,
    letterSpacing: 1,
  },

  glassStats: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: fonts.extraBold, color: P.white },
  statLab: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    letterSpacing: 1,
  },
  vDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
  },

  content: { padding: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.extraBold,
    color: P.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: P.goldSoft,
  },
  sectionEditText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: P.navy,
  },
  infoCard: {
    backgroundColor: P.white,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: P.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: P.navy,
  },

  settingsCard: {
    backgroundColor: P.white,
    borderRadius: 24,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 15,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: P.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerIcon: { backgroundColor: "rgba(239, 68, 68, 0.08)" },
  menuText: { fontSize: 15, fontFamily: fonts.bold, color: P.navy },
  menuSubtext: { fontSize: 12, color: P.muted, marginTop: 2 },
  hDivider: { height: 1, backgroundColor: P.cream, marginHorizontal: 4 },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetKeyboardAvoiding: {
    width: "100%",
  },
  sheetContainer: {
    backgroundColor: P.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 4,
    backgroundColor: P.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: P.navy,
    marginBottom: 14,
  },
  rowPair: {
    flexDirection: "row",
    gap: 10,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: P.navy,
    backgroundColor: P.cream,
  },
  sheetInputMultiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  sheetHalfInput: {
    flex: 1,
  },
  sheetInfoBox: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: P.cream,
    gap: 6,
  },
  sheetInfoText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: P.muted,
  },
  sheetLockedValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: P.navy,
  },
  genderOptionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: P.cream,
  },
  genderOptionActive: {
    borderColor: P.gold,
    backgroundColor: P.goldSoft,
  },
  genderOptionText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: P.navy,
  },
  genderOptionTextActive: {
    color: P.navy,
  },
  sheetSaveBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    backgroundColor: P.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSaveText: {
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: P.navy,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: { fontSize: 15, fontFamily: fonts.extraBold, color: "#EF4444" },
  versionText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 11,
    color: P.muted,
  },
});
