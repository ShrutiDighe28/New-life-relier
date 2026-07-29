import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { prescriptionService } from '../../prescriptions/services/prescriptionService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  Sparkles, 
  User, 
  Stethoscope, 
  BriefcaseMedical,
  Info
} from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS, SIZES } from '@/constants/theme';
import { PrescriptionAnalysis, Medicine } from '@/types/prescription';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Helper component for scale spring animation on press
function AnimatedButton({ 
  onPress, 
  style, 
  children, 
  activeOpacity = 0.8,
  disabled
}: { 
  onPress: () => void; 
  style?: any; 
  children: React.ReactNode;
  activeOpacity?: number;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedTouchableOpacity
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}

interface EditableMedicine extends Medicine {
  id: string;
  isEditing: boolean;
}

export default function ReviewEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ analysisData: string; uri: string; text: string }>();

  // Parse initial data from AI response
  let initialAnalysis: Partial<PrescriptionAnalysis> = {};
  try {
    if (params.analysisData) {
      initialAnalysis = JSON.parse(params.analysisData);
    }
  } catch (e) {
    console.error("Failed to parse analysisData", e);
  }

  // Local state for all fields
  const [doctorName, setDoctorName] = useState(initialAnalysis.doctorName || '');
  const [hospitalName, setHospitalName] = useState(initialAnalysis.hospitalName || '');
  const [date, setDate] = useState(initialAnalysis.date || new Date().toISOString().split('T')[0]);
  const [patientName, setPatientName] = useState(initialAnalysis.patientName || 'Gauresh Shinde');
  const [diagnosis, setDiagnosis] = useState(initialAnalysis.diagnosis || '');
  
  // Format medicines with unique local IDs and editing state
  const [medicines, setMedicines] = useState<EditableMedicine[]>(() => {
    const initialMeds = initialAnalysis.medicines || [];
    return initialMeds.map((med, index) => ({
      id: `initial-${index}-${Date.now()}`,
      name: med.name || '',
      strength: med.strength || '',
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      instructions: med.instructions || '',
      isEditing: false,
    }));
  });

  const confidence = initialAnalysis.confidence || 90;
  const [isSaving, setIsSaving] = useState(false);

  // Medicine CRUD Handlers
  const handleToggleEditMedicine = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, isEditing: !med.isEditing } : med))
    );
  };

  const handleUpdateMedicineField = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleDeleteMedicine = (id: string) => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to remove this medicine from the list?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMedicines(prev => prev.filter(med => med.id !== id));
          }
        }
      ]
    );
  };

  const handleAddMedicine = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newId = `new-${Date.now()}`;
    const newMed: EditableMedicine = {
      id: newId,
      name: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      isEditing: true,
    };
    setMedicines(prev => [...prev, newMed]);
  };

  // Screen Actions
  const handleCancel = () => {
    Alert.alert(
      "Discard Verification",
      "Are you sure you want to exit? Your changes and verified prescription will not be saved.",
      [
        { text: "Keep Reviewing", style: "cancel" },
        { 
          text: "Discard", 
          style: "destructive", 
          onPress: () => {
            router.dismissAll();
            router.navigate('/ai/prescription-scanner');
          }
        }
      ]
    );
  };

  const handleSave = () => {
    // Perform simple validation
    if (!doctorName.trim()) {
      Alert.alert("Validation Error", "Please provide a doctor name.");
      return;
    }
    if (!patientName.trim()) {
      Alert.alert("Validation Error", "Please provide a patient name.");
      return;
    }
    if (medicines.length === 0) {
      Alert.alert("Validation Error", "Please add at least one medicine.");
      return;
    }

    // Check if any medicine is currently in edit mode
    const editingCount = medicines.filter(m => m.isEditing).length;
    if (editingCount > 0) {
      Alert.alert(
        "Unsaved Medicine Cards",
        "Please finish editing all medicine cards before saving.",
        [{ text: "OK" }]
      );
      return;
    }

    const finalPrescription = {
      doctorName,
      hospitalName,
      prescriptionDate: date,
      patientName,
      diagnosis,
      medicines: medicines.map(({ id, isEditing, ...rest }) => rest),
      confidence,
      originalImageUri: params.uri || '',
      ocrText: params.text || '',
      warnings: initialAnalysis.warnings || [],
      followUp: initialAnalysis.followUp || '',
      scanDate: new Date().toISOString(),
    };

    setIsSaving(true);
    prescriptionService.savePrescription(finalPrescription)
      .then(() => {
        setIsSaving(false);
        Alert.alert(
          "Prescription Saved",
          "Your verified prescription has been successfully saved to your digital health records.",
          [
            {
              text: "OK",
              onPress: () => {
                router.dismissAll();
                router.navigate('/prescriptions');
              }
            }
          ]
        );
      })
      .catch((err: any) => {
        setIsSaving(false);
        Alert.alert("Save Failed", err?.message || "Could not save prescription.");
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify & Edit Prescription</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Banner & AI Confidence */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerLeft}>
              <Info size={20} color="#1E3A8A" />
              <Text style={styles.bannerText}>
                Please verify the extracted information before saving.
              </Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Sparkles size={14} color="#1E40AF" />
              <Text style={styles.confidenceText}>AI Match: {confidence}%</Text>
            </View>
          </View>

          {/* Doctor Information Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Stethoscope size={20} color={COLORS.primaryBlue} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Doctor Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Doctor Name</Text>
              <TextInput
                style={styles.textInput}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="Dr. John Doe"
                placeholderTextColor={COLORS.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hospital / Clinic</Text>
              <TextInput
                style={styles.textInput}
                value={hospitalName}
                onChangeText={setHospitalName}
                placeholder="General Clinic & Hospital"
                placeholderTextColor={COLORS.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prescription Date</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.secondaryText}
              />
            </View>
          </View>

          {/* Patient Information Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <User size={20} color={COLORS.primaryBlue} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Patient Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name</Text>
              <TextInput
                style={styles.textInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Gauresh Shinde"
                placeholderTextColor={COLORS.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Diagnosis / Reason</Text>
              <TextInput
                style={styles.textInput}
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="Cough and Cold"
                placeholderTextColor={COLORS.secondaryText}
              />
            </View>
          </View>

          {/* Medicines Section Header */}
          <View style={styles.medicinesHeaderContainer}>
            <BriefcaseMedical size={22} color={COLORS.primaryText} />
            <Text style={styles.listSectionTitle}>Medicine List</Text>
          </View>

          {/* Medicines List */}
          {medicines.map((med) => (
            <View key={med.id} style={styles.medicineCard}>
              {med.isEditing ? (
                // Edit Mode Card
                <View style={styles.editCardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.editingCardTitle}>Edit Medicine Info</Text>
                    <TouchableOpacity
                      onPress={() => handleToggleEditMedicine(med.id)}
                      style={styles.closeEditButton}
                    >
                      <Check size={18} color="#15803D" />
                      <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardInputGroup}>
                    <Text style={styles.cardInputLabel}>Medicine Name</Text>
                    <TextInput
                      style={styles.cardTextInput}
                      value={med.name}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'name', val)}
                      placeholder="e.g. Paracetamol"
                      placeholderTextColor={COLORS.secondaryText}
                    />
                  </View>

                  <View style={styles.gridRow}>
                    <View style={[styles.cardInputGroup, styles.flexOne, { marginRight: 8 }]}>
                      <Text style={styles.cardInputLabel}>Dosage</Text>
                      <TextInput
                        style={styles.cardTextInput}
                        value={med.dosage}
                        onChangeText={(val) => handleUpdateMedicineField(med.id, 'dosage', val)}
                        placeholder="e.g. 500 mg / 1 tablet"
                        placeholderTextColor={COLORS.secondaryText}
                      />
                    </View>
                    <View style={[styles.cardInputGroup, styles.flexOne]}>
                      <Text style={styles.cardInputLabel}>Frequency</Text>
                      <TextInput
                        style={styles.cardTextInput}
                        value={med.frequency}
                        onChangeText={(val) => handleUpdateMedicineField(med.id, 'frequency', val)}
                        placeholder="e.g. Twice daily"
                        placeholderTextColor={COLORS.secondaryText}
                      />
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={[styles.cardInputGroup, styles.flexOne, { marginRight: 8 }]}>
                      <Text style={styles.cardInputLabel}>Duration</Text>
                      <TextInput
                        style={styles.cardTextInput}
                        value={med.duration}
                        onChangeText={(val) => handleUpdateMedicineField(med.id, 'duration', val)}
                        placeholder="e.g. 5 days"
                        placeholderTextColor={COLORS.secondaryText}
                      />
                    </View>
                    <View style={[styles.cardInputGroup, styles.flexOne]}>
                      <Text style={styles.cardInputLabel}>Strength</Text>
                      <TextInput
                        style={styles.cardTextInput}
                        value={med.strength}
                        onChangeText={(val) => handleUpdateMedicineField(med.id, 'strength', val)}
                        placeholder="e.g. 500mg"
                        placeholderTextColor={COLORS.secondaryText}
                      />
                    </View>
                  </View>

                  <View style={styles.cardInputGroup}>
                    <Text style={styles.cardInputLabel}>Instructions</Text>
                    <TextInput
                      style={[styles.cardTextInput, styles.instructionsInput]}
                      value={med.instructions}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'instructions', val)}
                      placeholder="e.g. Take after food with warm water"
                      placeholderTextColor={COLORS.secondaryText}
                      multiline
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.deleteCardButton}
                    onPress={() => handleDeleteMedicine(med.id)}
                  >
                    <Trash2 size={16} color={COLORS.primaryRed} />
                    <Text style={styles.deleteCardText}>Delete Medicine</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Read Only Card
                <View style={styles.readCardContent}>
                  <View style={styles.medHeaderRow}>
                    <View style={styles.medHeaderLeft}>
                      <Text style={styles.medNameText}>{med.name || "Unnamed Medicine"}</Text>
                      {med.strength ? (
                        <View style={styles.strengthBadge}>
                          <Text style={styles.strengthText}>{med.strength}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.medDetailsGrid}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabelText}>Dosage</Text>
                      <Text style={styles.detailValueText}>{med.dosage || "As directed"}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabelText}>Frequency</Text>
                      <Text style={styles.detailValueText}>{med.frequency || "As directed"}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabelText}>Duration</Text>
                      <Text style={styles.detailValueText}>{med.duration || "N/A"}</Text>
                    </View>
                  </View>

                  {med.instructions ? (
                    <View style={styles.readInstructionsContainer}>
                      <Text style={styles.instructionsLabelText}>Instructions:</Text>
                      <Text style={styles.instructionsValueText}>{med.instructions}</Text>
                    </View>
                  ) : null}

                  {/* Card Controls */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={[styles.cardActionBtn, styles.editCardBtn]}
                      onPress={() => handleToggleEditMedicine(med.id)}
                    >
                      <Edit3 size={16} color={COLORS.primaryBlue} style={styles.cardBtnIcon} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.cardActionBtn, styles.deleteCardBtn]}
                      onPress={() => handleDeleteMedicine(med.id)}
                    >
                      <Trash2 size={16} color={COLORS.primaryRed} style={styles.cardBtnIcon} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Add Medicine Button */}
          <TouchableOpacity 
            style={styles.addMedicineButton}
            onPress={handleAddMedicine}
            activeOpacity={0.7}
          >
            <Plus size={20} color={COLORS.primaryBlue} style={styles.addIcon} />
            <Text style={styles.addMedicineText}>Add Medicine</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AnimatedButton
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </AnimatedButton>

        <AnimatedButton
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Prescription</Text>
          )}
        </AnimatedButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    flexShrink: 1,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.primaryText,
    backgroundColor: '#F8FAFC',
  },
  medicinesHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryText,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  readCardContent: {
    padding: 16,
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  medNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  strengthBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strengthText: {
    color: COLORS.primaryBlue,
    fontSize: 11,
    fontWeight: '700',
  },
  medDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
    marginBottom: 10,
  },
  detailGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabelText: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryText,
    textAlign: 'center',
  },
  readInstructionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  instructionsLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 2,
  },
  instructionsValueText: {
    fontSize: 12,
    color: COLORS.primaryText,
    lineHeight: 16,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  editCardBtn: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  deleteCardBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cardBtnIcon: {
    marginRight: 4,
  },
  editBtnText: {
    color: COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtnText: {
    color: COLORS.primaryRed,
    fontSize: 12,
    fontWeight: '600',
  },
  editCardContent: {
    padding: 18,
    backgroundColor: '#FCFDFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  editingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  doneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  cardInputGroup: {
    marginBottom: 12,
  },
  cardInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  cardTextInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: COLORS.primaryText,
    backgroundColor: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  instructionsInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  deleteCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  deleteCardText: {
    fontSize: 12,
    color: COLORS.primaryRed,
    fontWeight: '700',
  },
  addMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryBlue,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 30,
    gap: 6,
    ...SHADOWS.soft,
  },
  addIcon: {
    marginRight: 2,
  },
  addMedicineText: {
    color: COLORS.primaryBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
