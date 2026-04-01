import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/theme/colors';
import apiClient from '../src/services/api';
import { saveUserData } from '../src/services/auth';

// Types
interface StudentProfile {
  // Step 1
  profilePhoto?: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  
  // Step 2
  houseNo: string;
  area: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  
  // Step 3
  schoolName: string;
  schoolBoard: string;
  schoolAddress: string;
  class: string;
  
  // Step 4
  budget: string;
  preferredDays: string[];
  duration: string;
  teacherGender: string;
  subjects: string[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const COMMON_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

export default function StudentProfileSetup() {
  const { phone: routePhone } = useLocalSearchParams<{ phone: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  const [formData, setFormData] = useState<StudentProfile>({
    profilePhoto: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: routePhone || '',
    houseNo: '',
    area: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    schoolName: '',
    schoolBoard: '',
    schoolAddress: '',
    class: '',
    budget: '',
    preferredDays: [],
    duration: '',
    teacherGender: '',
    subjects: [],
  });

  // Image picker
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFormData(prev => ({ ...prev, profilePhoto: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    }
  };

  // Fetch city and state from pincode
  const fetchLocationFromPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setPincodeLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const location = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: location.District,
          state: location.State,
        }));
      } else {
        Alert.alert('Invalid Pincode', 'Could not find location for this pincode');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch location details');
    } finally {
      setPincodeLoading(false);
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          Alert.alert('Required', 'Please enter first name');
          return false;
        }
        if (!formData.lastName.trim()) {
          Alert.alert('Required', 'Please enter last name');
          return false;
        }
        if (!formData.dob) {
          Alert.alert('Required', 'Please enter date of birth');
          return false;
        }
        if (!formData.gender) {
          Alert.alert('Required', 'Please select gender');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.houseNo.trim()) {
          Alert.alert('Required', 'Please enter house/flat number');
          return false;
        }
        if (!formData.area.trim()) {
          Alert.alert('Required', 'Please enter area/locality');
          return false;
        }
        if (!formData.pincode || formData.pincode.length !== 6) {
          Alert.alert('Required', 'Please enter valid 6-digit pincode');
          return false;
        }
        if (!formData.city || !formData.state) {
          Alert.alert('Required', 'City and state are required');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.schoolName.trim()) {
          Alert.alert('Required', 'Please enter school name');
          return false;
        }
        if (!formData.schoolBoard) {
          Alert.alert('Required', 'Please select school board');
          return false;
        }
        if (!formData.schoolAddress.trim()) {
          Alert.alert('Required', 'Please enter school address');
          return false;
        }
        if (!formData.class) {
          Alert.alert('Required', 'Please select class/standard');
          return false;
        }
        return true;
        
      case 4:
        if (!formData.budget) {
          Alert.alert('Required', 'Please enter budget');
          return false;
        }
        if (formData.preferredDays.length === 0) {
          Alert.alert('Required', 'Please select at least one preferred day');
          return false;
        }
        if (!formData.duration) {
          Alert.alert('Required', 'Please enter session duration');
          return false;
        }
        if (!formData.teacherGender) {
          Alert.alert('Required', 'Please select teacher gender preference');
          return false;
        }
        if (formData.subjects.length === 0) {
          Alert.alert('Required', 'Please select at least one subject');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/student/register', formData);
      
      if (response.data && response.data.data) {
        await saveUserData(response.data.data);
        Alert.alert('Success!', 'Profile created successfully', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day],
    }));
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep > 1 && handleBack()} style={styles.backButton}>
          {currentStep > 1 && <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 4</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && (
          <Step1BasicDetails
            data={formData}
            setData={setFormData}
            pickImage={pickImage}
          />
        )}

        {currentStep === 2 && (
          <Step2Address
            data={formData}
            setData={setFormData}
            fetchLocation={fetchLocationFromPincode}
            pincodeLoading={pincodeLoading}
          />
        )}

        {currentStep === 3 && (
          <Step3Education
            data={formData}
            setData={setFormData}
          />
        )}

        {currentStep === 4 && (
          <Step4Preferences
            data={formData}
            setData={setFormData}
            toggleDay={toggleDay}
            toggleSubject={toggleSubject}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {currentStep === 4 ? 'Complete Profile' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Step 1: Basic Details
function Step1BasicDetails({ data, setData, pickImage }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>

      {/* Profile Photo */}
      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {data.profilePhoto ? (
          <Image source={{ uri: data.profilePhoto }} style={styles.photoImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={32} color={colors.gray[400]} />
          </View>
        )}
        <View style={styles.photoEdit}>
          <Ionicons name="pencil" size={16} color={colors.white} />
        </View>
      </TouchableOpacity>
      <Text style={styles.photoHint}>Tap to upload profile photo</Text>

      {/* First Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          placeholderTextColor={colors.gray[400]}
          value={data.firstName}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, firstName: text }))}
        />
      </View>

      {/* Last Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          placeholderTextColor={colors.gray[400]}
          value={data.lastName}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, lastName: text }))}
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.gray[400]}
          value={data.dob}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, dob: text }))}
          keyboardType="numeric"
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionsRow}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.optionChip, data.gender === gender && styles.optionChipActive]}
              onPress={() => setData((prev: any) => ({ ...prev, gender }))}
            >
              <Text style={[styles.optionText, data.gender === gender && styles.optionTextActive]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Phone (Read-only) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={data.phone}
          editable={false}
        />
        <Text style={styles.hint}>Verified via OTP</Text>
      </View>
    </View>
  );
}

// Step 2: Address
function Step2Address({ data, setData, fetchLocation, pincodeLoading }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Details</Text>
      <Text style={styles.stepSubtitle}>Where do you live?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>House/Flat No. *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter house/flat number"
          placeholderTextColor={colors.gray[400]}
          value={data.houseNo}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, houseNo: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Area/Locality *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter area or locality"
          placeholderTextColor={colors.gray[400]}
          value={data.area}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, area: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Landmark (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter nearby landmark"
          placeholderTextColor={colors.gray[400]}
          value={data.landmark}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, landmark: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode *</Text>
        <View style={styles.pincodeRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor={colors.gray[400]}
            value={data.pincode}
            onChangeText={(text) => {
              setData((prev: any) => ({ ...prev, pincode: text }));
              if (text.length === 6) {
                fetchLocation(text);
              }
            }}
            keyboardType="numeric"
            maxLength={6}
          />
          {pincodeLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
        </View>
        <Text style={styles.hint}>City and state will be auto-filled</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={data.city}
          editable={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>State *</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={data.state}
          editable={false}
        />
      </View>
    </View>
  );
}

// Step 3: Education
function Step3Education({ data, setData }: any) {
  const [customBoard, setCustomBoard] = useState('');
  const [showCustomBoard, setShowCustomBoard] = useState(false);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Education Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about your school</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>School Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter school name"
          placeholderTextColor={colors.gray[400]}
          value={data.schoolName}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, schoolName: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>School Board *</Text>
        <View style={styles.chipsContainer}>
          {BOARDS.map((board) => (
            <TouchableOpacity
              key={board}
              style={[styles.chip, data.schoolBoard === board && styles.chipActive]}
              onPress={() => {
                setData((prev: any) => ({ ...prev, schoolBoard: board }));
                setShowCustomBoard(board === 'Other');
              }}
            >
              <Text style={[styles.chipText, data.schoolBoard === board && styles.chipTextActive]}>
                {board}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {showCustomBoard && (
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Enter board name"
            placeholderTextColor={colors.gray[400]}
            value={customBoard}
            onChangeText={(text) => {
              setCustomBoard(text);
              setData((prev: any) => ({ ...prev, schoolBoard: text }));
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>School Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter school address"
          placeholderTextColor={colors.gray[400]}
          value={data.schoolAddress}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, schoolAddress: text }))}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Class/Standard *</Text>
        <View style={styles.chipsContainer}>
          {CLASSES.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={[styles.chip, data.class === cls && styles.chipActive]}
              onPress={() => setData((prev: any) => ({ ...prev, class: cls }))}
            >
              <Text style={[styles.chipText, data.class === cls && styles.chipTextActive]}>
                {cls}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// Step 4: Preferences
function Step4Preferences({ data, setData, toggleDay, toggleSubject }: any) {
  const [customSubject, setCustomSubject] = useState('');

  const addCustomSubject = () => {
    if (customSubject.trim()) {
      toggleSubject(customSubject.trim());
      setCustomSubject('');
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tuition Preferences</Text>
      <Text style={styles.stepSubtitle}>Help us find the perfect teacher for you</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget/Fees (₹ per hour) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter budget amount"
          placeholderTextColor={colors.gray[400]}
          value={data.budget}
          onChangeText={(text) => setData((prev: any) => ({ ...prev, budget: text }))}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Days *</Text>
        <View style={styles.chipsContainer}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.chip, data.preferredDays.includes(day) && styles.chipActive]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.chipText, data.preferredDays.includes(day) && styles.chipTextActive]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Session Duration (hours) *</Text>
        <View style={styles.optionsRow}>
          {['1', '1.5', '2', '2.5'].map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[styles.optionChip, data.duration === dur && styles.optionChipActive]}
              onPress={() => setData((prev: any) => ({ ...prev, duration: dur }))}
            >
              <Text style={[styles.optionText, data.duration === dur && styles.optionTextActive]}>
                {dur}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teacher Gender Preference *</Text>
        <View style={styles.optionsRow}>
          {['Male', 'Female', 'No Preference'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.optionChip, data.teacherGender === gender && styles.optionChipActive]}
              onPress={() => setData((prev: any) => ({ ...prev, teacherGender: gender }))}
            >
              <Text style={[styles.optionText, data.teacherGender === gender && styles.optionTextActive]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subjects *</Text>
        <View style={styles.chipsContainer}>
          {COMMON_SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[styles.chip, data.subjects.includes(subject) && styles.chipActive]}
              onPress={() => toggleSubject(subject)}
            >
              <Text style={[styles.chipText, data.subjects.includes(subject) && styles.chipTextActive]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.customInputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add custom subject"
            placeholderTextColor={colors.gray[400]}
            value={customSubject}
            onChangeText={setCustomSubject}
          />
          <TouchableOpacity style={styles.addButton} onPress={addCustomSubject}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        {data.subjects.filter((s: string) => !COMMON_SUBJECTS.includes(s)).map((subject: string) => (
          <View key={subject} style={styles.customSubjectChip}>
            <Text style={styles.customSubjectText}>{subject}</Text>
            <TouchableOpacity onPress={() => toggleSubject(subject)}>
              <Ionicons name="close-circle" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.gray[900],
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[600],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[600],
    marginBottom: 24,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  photoHint: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[900],
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.gray[600],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: colors.gray[500],
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  optionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[700],
  },
  optionTextActive: {
    color: colors.white,
  },
  pincodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[700],
  },
  chipTextActive: {
    color: colors.white,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSubjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  customSubjectText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: colors.gray[700],
  },
  footer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.white,
  },
});
