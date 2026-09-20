import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors, fonts } from "../../src/theme/colors";

export default function ClassroomScreen() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(3340); // 55 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    Alert.alert(
      "End Classroom Session",
      "Are you sure you want to leave the live classroom session?",
      [
        { text: "Stay in Class", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: () => router.replace("/rate-session"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ── TEACHER MAIN VIDEO FEED ── */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
        }}
        style={styles.mainTeacherVideo}
      />

      <SafeAreaView style={styles.overlayContainer}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.liveTag}>
            <View style={styles.redDot} />
            <Text style={styles.liveText}>LIVE SESSION</Text>
          </View>

          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.timerText}>{formatTimer(secondsRemaining)}</Text>
          </View>

          <TouchableOpacity style={styles.leaveHeaderBtn} onPress={handleEndSession}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* STUDENT PIP VIDEO OVERLAY */}
        <View style={styles.pipContainer}>
          {cameraOn ? (
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
              }}
              style={styles.pipVideo}
            />
          ) : (
            <View style={styles.pipCamOff}>
              <Ionicons name="videocam-off" size={20} color="#94A3B8" />
            </View>
          )}
          <View style={styles.pipLabel}>
            <Text style={styles.pipLabelText}>Aarav (You)</Text>
          </View>
        </View>

        {/* TEACHER NAME OVERLAY */}
        <View style={styles.teacherOverlayCard}>
          <Text style={styles.teacherNameText}>Priya Sharma (Mathematics)</Text>
          <Text style={styles.topicText}>Topic: Class 10 Trigonometry & Identities</Text>
        </View>

        {/* BOTTOM CONTROLS BAR */}
        <View style={styles.controlsBar}>
          {/* Mic Toggle */}
          <TouchableOpacity
            style={[styles.controlBtn, !micOn && styles.controlBtnOff]}
            onPress={() => setMicOn(!micOn)}
          >
            <Ionicons
              name={micOn ? "mic" : "mic-off"}
              size={22}
              color={micOn ? "#0D1B2A" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Camera Toggle */}
          <TouchableOpacity
            style={[styles.controlBtn, !cameraOn && styles.controlBtnOff]}
            onPress={() => setCameraOn(!cameraOn)}
          >
            <Ionicons
              name={cameraOn ? "videocam" : "videocam-off"}
              size={22}
              color={cameraOn ? "#0D1B2A" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Share Screen */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => Alert.alert("Share Screen", "Screen sharing is active.")}
          >
            <Ionicons name="desktop-outline" size={22} color="#0D1B2A" />
          </TouchableOpacity>

          {/* Chat Drawer */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() =>
              router.push({
                pathname: "/messages/[id]",
                params: { id: "conv-tch-1" },
              })
            }
          >
            <Ionicons name="chatbubble-ellipses" size={22} color="#0D1B2A" />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndSession}>
            <Ionicons name="call" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  mainTeacherVideo: { width: "100%", height: "100%", position: "absolute" },

  overlayContainer: { flex: 1, justifyContent: "space-between", padding: 20 },

  topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(220,38,38,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  liveText: { color: "#FFFFFF", fontSize: 10, fontFamily: fonts.bold },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { color: "#FFFFFF", fontSize: 12, fontFamily: fonts.bold },
  leaveHeaderBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },

  pipContainer: { position: "absolute", top: 80, right: 20, width: 110, height: 150, borderRadius: 14, overflow: "hidden", borderWidth: 2, borderColor: "#E8A838", elevation: 6 },
  pipVideo: { width: "100%", height: "100%" },
  pipCamOff: { width: "100%", height: "100%", backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  pipLabel: { position: "absolute", bottom: 4, left: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 2, borderRadius: 4, alignItems: "center" },
  pipLabelText: { color: "#FFFFFF", fontSize: 9, fontFamily: fonts.bold },

  teacherOverlayCard: { backgroundColor: "rgba(13,27,42,0.85)", padding: 14, borderRadius: 14, marginBottom: 20 },
  teacherNameText: { color: "#FFFFFF", fontSize: 15, fontFamily: fonts.bold },
  topicText: { color: "#94A3B8", fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },

  controlsBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(15,23,42,0.9)", paddingVertical: 14, paddingHorizontal: 10, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  controlBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  controlBtnOff: { backgroundColor: "#DC2626" },
  endCallBtn: { width: 54, height: 48, borderRadius: 24, backgroundColor: "#DC2626", alignItems: "center", justifyContent: "center" },
});
