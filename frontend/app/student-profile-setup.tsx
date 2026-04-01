import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const P = {
  navy: "#0D1B2A",
  navyMid: "#112236",
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldDim: "rgba(232,168,56,0.12)",
  goldBorder: "rgba(232,168,56,0.30)",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  ink: "#0D1B2A",
  muted: "#8A9BB0",
  mutedDark: "#5A7080",
  border: "#E4EAF2",
  inputBg: "#F4F7FB",
  success: "#27AE60",
  successPale: "rgba(39,174,96,0.10)",
  successBorder: "rgba(39,174,96,0.25)",
};

const STEPS = [
  {
    icon: "person-outline" as const,
    title: "Personal Details",
    sub: "Let's start with your basics",
  },
  {
    icon: "home-outline" as const,
    title: "Where should we meet?",
    sub: "Your location helps match nearby tutors",
  },
  {
    icon: "school-outline" as const,
    title: "Educational Background",
    sub: "Tell us about your school",
  },
  {
    icon: "options-outline" as const,
    title: "Your Preferences",
    sub: "Help us find the perfect tutor",
  },
];

const BOARDS = ["CBSE", "ICSE", "State", "IB", "IGCSE"];
const CLASSES = ["8th", "9th", "10th", "11th", "12th"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer Sci",
];
const DURATIONS = ["1h", "1.5h", "2h", "2.5h"];

// ─── Shared Atoms ──────────────────────────────────────────────────────────────
function SmartInput({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={atom.inputWrap}>
      <Text style={[atom.inputLabel, focused && { color: P.gold }]}>
        {label}
      </Text>
      <View
        style={[
          atom.inputBox,
          focused && atom.inputBoxFocused,
          props.editable === false && atom.inputBoxDisabled,
        ]}
      >
        <Ionicons name={icon} size={16} color={focused ? P.gold : P.muted} />
        <TextInput
          style={atom.inputField}
          placeholderTextColor={P.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
}

function PressableInput({
  label,
  icon,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  placeholder?: string;
  onPress: () => void;
}) {
  return (
    <View style={atom.inputWrap}>
      <Text style={atom.inputLabel}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          atom.inputBox,
          pressed && atom.inputBoxFocused,
        ]}
      >
        <Ionicons name={icon} size={16} color={P.muted} />
        <Text style={[atom.inputField, !value && { color: P.muted }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={P.muted} />
      </Pressable>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.8}
      style={[atom.chip, active && atom.chipActive]}
    >
      {active && (
        <Ionicons
          name="checkmark"
          size={10}
          color={P.navy}
          style={{ marginRight: 3 }}
        />
      )}
      <Text style={[atom.chipText, active && atom.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OptionPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.8}
      style={[atom.pill, active && atom.pillActive]}
    >
      <Text style={[atom.pillText, active && atom.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={atom.sectionLabel}>{text}</Text>;
}

function CardDivider() {
  return (
    <View style={{ height: 1, backgroundColor: P.border, marginVertical: 6 }} />
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return <View style={atom.card}>{children}</View>;
}

// ─── Step 1: Personal ──────────────────────────────────────────────────────────
function Step1({
  dob,
  showIosPicker,
  onDobPress,
  onDateSelected,
  onDismissIos,
  profilePhoto,
  onPickImage,
  gender,
  setGender,
}: any) {
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;

  return (
    <View style={{ gap: 14 }}>
      {/* Avatar */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <TouchableOpacity
          onPress={onPickImage}
          activeOpacity={0.85}
          style={{ position: "relative" }}
        >
          <LinearGradient
            colors={[P.gold, P.goldLight, P.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={step1.avatarRing}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={step1.avatarImg} />
            ) : (
              <View style={step1.avatarFallback}>
                <Ionicons name="camera" size={26} color={P.gold} />
              </View>
            )}
          </LinearGradient>
          <View style={step1.avatarBadge}>
            <Ionicons name="pencil" size={11} color={P.navy} />
          </View>
        </TouchableOpacity>
        <Text style={step1.avatarHint}>Tap to add photo</Text>
      </View>

      <FormCard>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SmartInput
              label="FIRST NAME"
              icon="person-outline"
              placeholder="First"
            />
          </View>
          <View style={{ flex: 1 }}>
            <SmartInput
              label="LAST NAME"
              icon="person-outline"
              placeholder="Last"
            />
          </View>
        </View>
        <CardDivider />
        <PressableInput
          label="DATE OF BIRTH"
          icon="calendar-outline"
          placeholder="DD / MM / YYYY"
          value={dob ? fmt(dob) : ""}
          onPress={onDobPress}
        />
        {Platform.OS === "ios" && showIosPicker && (
          <View style={step1.iosPicker}>
            <DateTimePicker
              value={dob ?? new Date(2010, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={onDateSelected}
            />
            <TouchableOpacity onPress={onDismissIos} style={step1.iosDoneBtn}>
              <Text style={step1.iosDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </FormCard>

      <FormCard>
        <SectionLabel text="GENDER" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
          {["Male", "Female", "Other"].map((g) => (
            <OptionPill
              key={g}
              label={g}
              active={gender === g}
              onPress={() => setGender(g)}
            />
          ))}
        </View>
      </FormCard>

      <FormCard>
        <SmartInput
          label="PHONE NUMBER"
          icon="call-outline"
          editable={false}
          value="+91 98765 43210"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 6,
          }}
        >
          <Ionicons name="shield-checkmark" size={12} color={P.success} />
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Manrope_500Medium",
              color: P.success,
            }}
          >
            Verified via OTP
          </Text>
        </View>
      </FormCard>
    </View>
  );
}

const step1 = StyleSheet.create({
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 84, height: 84, borderRadius: 25 },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 25,
    backgroundColor: P.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: P.gold,
    borderWidth: 2.5,
    borderColor: P.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    marginTop: 8,
  },
  iosPicker: {
    backgroundColor: P.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: P.border,
    overflow: "hidden",
    marginTop: 8,
  },
  iosDoneBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  iosDoneText: { fontSize: 14, fontFamily: "Manrope_700Bold", color: P.navy },
});

// ─── Step 2: Address ───────────────────────────────────────────────────────────
function Step2() {
  return (
    <View style={{ gap: 14 }}>
      <FormCard>
        <SmartInput
          label="HOUSE / FLAT NO."
          icon="home-outline"
          placeholder="e.g. 402, Green Valley Apts"
        />
        <CardDivider />
        <SmartInput
          label="AREA / LOCALITY"
          icon="map-outline"
          placeholder="e.g. Andheri West"
        />
        <CardDivider />
        <SmartInput
          label="LANDMARK (OPTIONAL)"
          icon="flag-outline"
          placeholder="Near City Mall"
        />
      </FormCard>
      <FormCard>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SmartInput
              label="PINCODE"
              icon="location-outline"
              keyboardType="numeric"
              maxLength={6}
              placeholder="6 digits"
            />
          </View>
          <View style={{ flex: 1 }}>
            <SmartInput
              label="CITY"
              icon="business-outline"
              editable={false}
              value="Mumbai"
            />
          </View>
        </View>
        <CardDivider />
        <SmartInput
          label="STATE"
          icon="map-outline"
          editable={false}
          value="Maharashtra"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 6,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={12}
            color={P.muted}
          />
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Manrope_400Regular",
              color: P.muted,
            }}
          >
            City & state auto-filled from pincode
          </Text>
        </View>
      </FormCard>
    </View>
  );
}

// ─── Step 3: Education ─────────────────────────────────────────────────────────
function Step3({ board, setBoard, cls, setCls }: any) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <FormCard>
        <SmartInput
          label="SCHOOL NAME"
          icon="school-outline"
          placeholder="Enter school name"
        />
        <CardDivider />
        <SmartInput
          label="SCHOOL ADDRESS"
          icon="location-outline"
          placeholder="Full school address"
          multiline
          numberOfLines={2}
        />
      </FormCard>
      <FormCard>
        <SectionLabel text="SCHOOL BOARD" />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
          }}
        >
          {[...BOARDS, "Other"].map((b) => (
            <Chip
              key={b}
              label={b}
              active={board === b}
              onPress={() => {
                setBoard(b);
                setShowCustom(b === "Other");
              }}
            />
          ))}
        </View>
        {showCustom && (
          <>
            <CardDivider />
            <SmartInput
              label="BOARD NAME"
              icon="create-outline"
              placeholder="Enter custom board"
            />
          </>
        )}
      </FormCard>
      <FormCard>
        <SectionLabel text="CLASS / STANDARD" />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
          }}
        >
          {CLASSES.map((c) => (
            <Chip
              key={c}
              label={`Class ${c}`}
              active={cls === c}
              onPress={() => setCls(c)}
            />
          ))}
        </View>
      </FormCard>
    </View>
  );
}

// ─── Step 4: Preferences ───────────────────────────────────────────────────────
function Step4({
  days,
  toggleDay,
  teacherPref,
  setTeacherPref,
  subjects,
  toggleSubject,
  duration,
  setDuration,
}: any) {
  const [customSub, setCustomSub] = useState("");
  return (
    <View style={{ gap: 14 }}>
      <FormCard>
        <SmartInput
          label="BUDGET (₹ PER HOUR)"
          icon="cash-outline"
          placeholder="e.g. 500"
          keyboardType="numeric"
        />
        <CardDivider />
        <SectionLabel text="SESSION DURATION" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          {DURATIONS.map((d) => (
            <OptionPill
              key={d}
              label={d}
              active={duration === d}
              onPress={() => setDuration(d)}
            />
          ))}
        </View>
      </FormCard>
      <FormCard>
        <SectionLabel text="PREFERRED DAYS" />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
          }}
        >
          {DAYS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={days.includes(d)}
              onPress={() => toggleDay(d)}
            />
          ))}
        </View>
      </FormCard>
      <FormCard>
        <SectionLabel text="TEACHER PREFERENCE" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          {["Male", "Female", "No Preference"].map((g) => (
            <OptionPill
              key={g}
              label={g}
              active={teacherPref === g}
              onPress={() => setTeacherPref(g)}
            />
          ))}
        </View>
      </FormCard>
      <FormCard>
        <SectionLabel text="SUBJECTS NEEDED" />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
          }}
        >
          {SUBJECTS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={subjects.includes(s)}
              onPress={() => toggleSubject(s)}
            />
          ))}
        </View>
        <CardDivider />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            style={[atom.inputBox, { flex: 1 }]}
            placeholder="Add custom subject..."
            placeholderTextColor={P.muted}
            value={customSub}
            onChangeText={setCustomSub}
          />
          <TouchableOpacity
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: P.gold,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              if (customSub.trim()) {
                toggleSubject(customSub.trim());
                setCustomSub("");
              }
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color={P.navy} />
          </TouchableOpacity>
        </View>
        {subjects.filter((s: string) => !SUBJECTS.includes(s)).length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 10,
            }}
          >
            {subjects
              .filter((s: string) => !SUBJECTS.includes(s))
              .map((s: string) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => toggleSubject(s)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: P.inputBg,
                    borderWidth: 1,
                    borderColor: P.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Manrope_500Medium",
                      color: P.ink,
                    }}
                  >
                    {s}
                  </Text>
                  <Ionicons name="close" size={12} color={P.muted} />
                </TouchableOpacity>
              ))}
          </View>
        )}
      </FormCard>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function StudentProfileSetup() {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState<Date | null>(null);
  const [showIosDob, setShowIosDob] = useState(false);
  const [board, setBoard] = useState("CBSE");
  const [cls, setCls] = useState("10th");
  const [days, setDays] = useState<string[]>(["Mon", "Wed"]);
  const [teacherPref, setTeacherPref] = useState("Female");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [duration, setDuration] = useState("1h");
  const [gender, setGender] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const progress = useSharedValue(0.25);
  useEffect(() => {
    progress.value = withSpring(step / 4, { damping: 20 });
  }, [progress, step]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const onDateSelected = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedDate) setDob(selectedDate);
      return;
    }
    if (selectedDate) setDob(selectedDate);
  };

  const handleDobPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dob ?? new Date(2010, 0, 1),
        mode: "date",
        maximumDate: new Date(),
        onChange: onDateSelected,
      });
      return;
    }
    setShowIosDob(true);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!res.canceled) setProfilePhoto(res.assets[0].uri);
  };

  const toggleDay = (d: string) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const toggleSubject = (s: string) =>
    setSubjects((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const handleNext = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (step < 4) setStep((s) => s + 1);
    else router.replace("/(tabs)/home");
  };

  const meta = STEPS[step - 1];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar backgroundColor="white" translucent barStyle="dark-content" />
      {/* ── Nav ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 1 && styles.navBtnDisabled]}
            onPress={() => step > 1 && setStep((s) => s - 1)}
            disabled={step === 1}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={18} color={P.ink} />
          </TouchableOpacity>

          <View style={styles.headerCenterMeta}>
            <Text style={styles.headerEyebrow}>{meta.title}</Text>
            <Text style={styles.headerStepText}>Step {step} of 4</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {Math.round((step / 4) * 100)}%
            </Text>
          </View>
        </View>

        {/* <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]}>
              <LinearGradient
                colors={[P.gold, P.goldLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressHint}>
            {step === 4 ? "Final step" : "Keep going"}
          </Text>
        </View> */}

        <View style={styles.dotsRow}>
          {STEPS.map((s, i) => {
            const idx = i + 1;
            const done = idx < step;
            const active = idx === step;
            return (
              <React.Fragment key={idx}>
                <View
                  style={[
                    styles.dot,
                    active && styles.dotActive,
                    done && styles.dotDone,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={11} color={P.navy} />
                  ) : (
                    <Ionicons
                      name={s.icon}
                      size={13}
                      color={active ? P.navy : P.muted}
                    />
                  )}
                </View>
                {i < 3 && (
                  <View style={[styles.dotLine, done && styles.dotLineDone]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* <View style={styles.banner}>
          <View style={styles.bannerBackground} />
          <View style={styles.bannerIconBox}>
            <Ionicons name={meta.icon} size={14} color={P.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{meta.title}</Text>
            <Text style={styles.bannerSub}>{meta.sub}</Text>
          </View>
        </View> */}
      </View>

      {/* ── Scrollable form ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          key={step}
          entering={FadeInRight.duration(320)}
          exiting={FadeOutLeft.duration(200)}
        >
          {step === 1 && (
            <Step1
              dob={dob}
              showIosPicker={showIosDob}
              onDobPress={handleDobPress}
              onDateSelected={onDateSelected}
              onDismissIos={() => setShowIosDob(false)}
              profilePhoto={profilePhoto}
              onPickImage={pickImage}
              gender={gender}
              setGender={setGender}
            />
          )}
          {step === 2 && <Step2 />}
          {step === 3 && (
            <Step3
              board={board}
              setBoard={setBoard}
              cls={cls}
              setCls={setCls}
            />
          )}
          {step === 4 && (
            <Step4
              days={days}
              toggleDay={toggleDay}
              teacherPref={teacherPref}
              setTeacherPref={setTeacherPref}
              subjects={subjects}
              toggleSubject={toggleSubject}
              duration={duration}
              setDuration={setDuration}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          style={styles.cta}
        >
          <LinearGradient
            colors={[P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaInner}
          >
            <Text style={styles.ctaText}>
              {step === 4 ? "COMPLETE SETUP" : "CONTINUE"}
            </Text>
            <View style={styles.ctaArrow}>
              <Ionicons
                name={step === 4 ? "checkmark" : "arrow-forward"}
                size={14}
                color={P.navy}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Atom styles ───────────────────────────────────────────────────────────────
const atom = StyleSheet.create({
  // Input
  inputWrap: { gap: 7 },
  inputLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.inputBg,
    borderRadius: 13,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: P.border,
    gap: 10,
  },
  inputBoxFocused: { borderColor: P.gold, backgroundColor: "#FFFDF7" },
  inputBoxDisabled: { backgroundColor: "#EDEEF2", opacity: 0.7 },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: P.ink,
  },

  // Chip
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: P.white,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  chipActive: { backgroundColor: P.gold, borderColor: P.gold },
  chipText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: P.muted },
  chipTextActive: { color: P.navy, fontFamily: "Manrope_700Bold" },

  // Pill
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: P.white,
    borderWidth: 1.5,
    borderColor: P.border,
    alignItems: "center",
    minWidth: 72,
  },
  pillActive: { backgroundColor: P.navy, borderColor: P.navy },
  pillText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: P.muted },
  pillTextActive: { color: P.cream, fontFamily: "Manrope_700Bold" },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.mutedDark,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // Card
  card: {
    backgroundColor: P.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    gap: 14,
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

// ─── Layout styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },

  headerCard: {
    // marginHorizontal: 20,
    // marginTop: 10,
    marginBottom: 12,
    padding: 16,
    // borderRadius: 22,
    backgroundColor: P.white,
    // borderWidth: 1,
    // borderColor: "rgba(13,27,42,0.06)",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  headerCenterMeta: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  headerEyebrow: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: P.gold,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  headerStepText: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(13,27,42,0.06)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressRow: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressHint: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: P.muted,
  },
  stepBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
  },
  stepBadgeText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: P.gold },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "Manrope_800ExtraBold",
    color: P.navy,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 14,
    color: P.muted,
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 30,
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: P.white,
    borderWidth: 1.5,
    borderColor: P.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dotActive: { backgroundColor: P.gold, borderColor: P.gold },
  dotDone: { backgroundColor: P.goldDim, borderColor: P.goldBorder },
  dotLine: {
    flex: 1,
    height: 2,
    backgroundColor: P.border,
    marginHorizontal: 5,
  },
  dotLineDone: { backgroundColor: P.gold },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 2,
    backgroundColor: P.cream,
    borderWidth: 1,
    borderColor: "rgba(13,27,42,0.04)",
    overflow: "hidden",
  },
  bannerBackground: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(232,168,56,0.06)",
    top: -60,
    right: -40,
  },
  bannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: P.goldDim,
    borderWidth: 1,
    borderColor: P.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bannerTitle: {
    fontSize: 23,
    fontFamily: "Manrope_700Bold",
    color: P.navy,
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: P.muted,
    marginTop: 2,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  footer: {
    padding: 20,
    backgroundColor: P.cream,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  cta: { borderRadius: 16, overflow: "hidden" },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    color: P.navy,
    letterSpacing: 1.2,
  },
  ctaArrow: {
    // width: 26,
    // height: 26,
    // borderRadius: 9,
    // backgroundColor: P.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
