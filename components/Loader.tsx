import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { BlurView } from "expo-blur";

type LoaderProps = {
  visible: boolean;
};

export default function Loader({ visible }: LoaderProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={50} tint="dark" style={styles.blur}>
          <ActivityIndicator size="large" color="#ffffff" />
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  blur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
