import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/theme/colors";
import { useChatStore } from "../../src/store/chatStore";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const thread = threads.find((t) => t.id === id) || threads[0];

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(thread.id, inputText);
      setInputText("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const quickReplies = [
    "What time works for tomorrow?",
    "Thank you!",
    "Please confirm the schedule.",
    "Can we reschedule?",
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0D1B2A" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: thread.teacherAvatar }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherName}>{thread.teacherName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>Online · {thread.teacherSubject} Tutor</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() =>
            router.push({
              pathname: "/teacher/[id]",
              params: { id: thread.teacherId },
            })
          }
        >
          <Ionicons name="information-circle-outline" size={24} color="#0D1B2A" />
        </TouchableOpacity>
      </View>

      {/* Child Context Bar */}
      <View style={styles.contextBar}>
        <Ionicons name="person" size={13} color="#4F46E5" />
        <Text style={styles.contextText}>
          {thread.childName} • {thread.teacherSubject}
        </Text>
      </View>

      {/* ── MESSAGES LIST ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {thread.messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemCard}>
                  <Ionicons name="sparkles" size={13} color="#D97706" />
                  <Text style={styles.systemText}>{msg.text}</Text>
                </View>
              );
            }

            const isUser = msg.senderId === "user";
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowTeacher]}
              >
                {!isUser && (
                  <Image source={{ uri: thread.teacherAvatar }} style={styles.msgAvatar} />
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleTeacher,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextTeacher,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <View style={styles.msgMeta}>
                    <Text
                      style={[
                        styles.timeText,
                        isUser ? { color: "rgba(255,255,255,0.6)" } : { color: "#94A3B8" },
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                    {isUser && (
                      <Ionicons
                        name="checkmark-done"
                        size={12}
                        color="rgba(255,255,255,0.7)"
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRepliesScroll}
          contentContainerStyle={styles.quickRepliesRow}
        >
          {quickReplies.map((qr) => (
            <TouchableOpacity
              key={qr}
              style={styles.quickReplyPill}
              onPress={() => setInputText(qr)}
            >
              <Text style={styles.quickReplyText}>{qr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach-outline" size={22} color="#64748B" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Message teacher..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? "#0D1B2A" : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 10,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E8A838",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  teacherName: { fontSize: 15, fontFamily: fonts.bold, color: "#0D1B2A" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  statusText: { fontSize: 11, fontFamily: fonts.regular, color: "#64748B" },
  infoBtn: { padding: 4 },

  contextBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  contextText: { fontSize: 11, fontFamily: fonts.semiBold, color: "#4F46E5" },

  messagesList: { padding: 16, paddingBottom: 4, gap: 6 },

  systemCard: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginVertical: 10,
  },
  systemText: { fontSize: 11, fontFamily: fonts.medium, color: "#92400E" },

  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowTeacher: { justifyContent: "flex-start" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },

  bubble: { maxWidth: "78%", padding: 12, borderRadius: 18 },
  bubbleUser: { backgroundColor: "#0D1B2A", borderBottomRightRadius: 4 },
  bubbleTeacher: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  msgText: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  msgTextUser: { color: "#FFFFFF" },
  msgTextTeacher: { color: "#0D1B2A" },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  timeText: { fontSize: 10, fontFamily: fonts.regular },

  quickRepliesScroll: { maxHeight: 46, backgroundColor: "#FFFFFF" },
  quickRepliesRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  quickReplyPill: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  quickReplyText: { fontSize: 11, fontFamily: fonts.medium, color: "#475569" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0D1B2A",
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8A838",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnDisabled: { backgroundColor: "#F1F5F9" },
});
