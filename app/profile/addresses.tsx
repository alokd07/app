import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";
import { useUserStore } from "../../src/store/userStore";

export default function AddressManagementScreen() {
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const [label, setLabel] = useState("Home");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  const handleAdd = () => {
    if (!houseNo || !street || !area) {
      return;
    }
    addAddress({
      label,
      houseNo,
      street,
      area,
      city,
      state: "Delhi",
      pincode: pincode || "110001",
      landmark,
      isDefault: addresses.length === 0,
    });
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home Tuition Addresses</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {addresses.map((addr) => (
          <View key={addr.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.labelPill}>
                <Ionicons name="home-outline" size={14} color="#0D1B2A" />
                <Text style={styles.labelText}>{addr.label}</Text>
              </View>

              {addr.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT ADDRESS</Text>
                </View>
              )}
            </View>

            <Text style={styles.addressText}>
              {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
            </Text>
            {addr.landmark ? (
              <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
            ) : null}

            <View style={styles.cardActions}>
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => setDefaultAddress(addr.id)}>
                  <Text style={styles.actionText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeAddress(addr.id)}>
                <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Home Tuition Address</Text>

            <TextInput style={styles.input} placeholder="Label (e.g. Home, Study Room)" value={label} onChangeText={setLabel} />
            <TextInput style={styles.input} placeholder="House / Flat / Plot No. *" value={houseNo} onChangeText={setHouseNo} />
            <TextInput style={styles.input} placeholder="Street / Block *" value={street} onChangeText={setStreet} />
            <TextInput style={styles.input} placeholder="Area / Sector *" value={area} onChangeText={setArea} />
            <TextInput style={styles.input} placeholder="City *" value={city} onChangeText={setCity} />
            <TextInput style={styles.input} placeholder="PIN Code" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Nearby Landmark (Optional)" value={landmark} onChangeText={setLandmark} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A" },
  addText: { fontSize: 14, fontFamily: fonts.bold, color: "#E8A838" },

  card: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  labelPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  labelText: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },
  defaultBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultText: { fontSize: 9, fontFamily: fonts.bold, color: "#059669" },

  addressText: { fontSize: 13, fontFamily: fonts.medium, color: "#334155", lineHeight: 20 },
  landmarkText: { fontSize: 12, fontFamily: fonts.regular, color: "#64748B", marginTop: 4 },

  cardActions: { flexDirection: "row", gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  actionText: { fontSize: 12, fontFamily: fonts.bold, color: "#0D1B2A" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 10 },
  modalTitle: { fontSize: 18, fontFamily: fonts.bold, color: "#0D1B2A", marginBottom: 6 },
  input: { backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontFamily: fonts.regular, color: "#0D1B2A" },
  saveBtn: { backgroundColor: "#0D1B2A", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  saveText: { color: "#FFFFFF", fontSize: 14, fontFamily: fonts.bold },
});
