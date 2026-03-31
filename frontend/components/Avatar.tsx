import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  uri?: string;
  name?: string;
  size?: number;
};

export default function Avatar({ uri, name, size = 48 }: Props) {
  const hasImage = uri && uri.trim() !== "";

  // Generate initials fallback
  const getInitials = () => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0];
    return parts[0][0] + parts[1][0];
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {hasImage ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : name ? (
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
          {getInitials().toUpperCase()}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color="#999" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    color: "#333",
    fontWeight: "600",
  },
});
