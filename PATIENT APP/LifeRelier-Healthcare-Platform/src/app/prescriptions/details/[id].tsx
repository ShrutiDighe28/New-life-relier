import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, Share, ActivityIndicator, Platform, TextInput, LayoutAnimation, UIManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, Share2, FileDown, Bell, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, CheckCircle, Edit3, Plus } from 'lucide-react-native';
import { prescriptionService } from '../services/prescriptionService';
import { Prescription } from '../types';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PrescriptionDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOcrExpanded, setIsOcrExpanded] = useState(false);

  // Editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      if (id) {
        setIsLoading(true);
        const record = await prescriptionService.getPrescriptionById(id);
        setPrescription(record);
        if (record) {
          setDoctorName(record.doctorName || '');
          setHospitalName(record.hospitalName || '');
          setDate(record.prescriptionDate || '');
          setPatientName(record.patientName || '');
          setDiagnosis(record.diagnosis || '');
          setMedicines(record.medicines?.map((med, index) => ({
            ...med,
            id: (med as any).id || `med-${index}-${Date.now()}`,
            isEditing: false
          })) || []);
        }
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDelete = () => {
    if (!prescription) return;
    
    Alert.alert(
      "Delete Record",
      "Are you sure you want to permanently delete this prescription from your digital record?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const success = await prescriptionService.deletePrescription(prescription.id);
            if (success) {
              Alert.alert("Success", "Record deleted successfully.", [
                { text: "OK", onPress: () => router.back() }
              ]);
            } else {
              Alert.alert("Error", "Failed to delete record.");
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!prescription) return;

    try {
      const medList = prescription.medicines
        .map((med: any) => `- ${med.name} (${med.strength || 'N/A'}): ${med.dosage || 'As directed'}, ${med.frequency || 'N/A'} for ${med.duration || 'N/A'}`)
        .join('\n');

      const shareContent = `Prescription Record Summary (via Life Relier)
Date: ${new Date(prescription.scanDate).toLocaleDateString()}
Doctor: ${prescription.doctorName}
Hospital: ${prescription.hospitalName}
Diagnosis: ${prescription.diagnosis || 'N/A'}

Prescribed Medicines:
${medList}

Follow-up Directions: ${prescription.followUp || 'N/A'}
Warnings: ${prescription.warnings?.join(', ') || 'None'}`;

      await Share.share({
        message: shareContent,
        title: `Prescription by ${prescription.doctorName}`,
      });
    } catch (err: any) {
      console.error('Failed to share:', err);
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert("Download PDF", "PDF export and downloading will be available in the next release.");
  };

  const handleAddReminder = () => {
    if (!prescription || !prescription.medicines || prescription.medicines.length === 0) {
      router.push('/reminders/create' as any);
      return;
    }

    const med = prescription.medicines[0];
    router.push({
      pathname: '/reminders/create' as any,
      params: {
        medicineName: med.name,
        dosage: med.strength ? `${med.dosage} (${med.strength})` : med.dosage,
        frequency: med.frequency || 'Daily',
        prescriptionId: prescription.id,
      }
    });
  };

  // Medicine Edit Handlers (details inline)
  const handleToggleEditMedicine = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, isEditing: !med.isEditing } : med))
    );
  };

  const handleUpdateMedicineField = (id: string, field: string, value: string) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleDeleteMedicine = (id: string) => {
    Alert.alert(
      "Remove Medicine",
      "Are you sure you want to remove this medicine?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
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
    const newMed = {
      id: `new-${Date.now()}`,
      name: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      isEditing: true
    };
    setMedicines(prev => [...prev, newMed]);
  };

  const handleSaveChanges = async () => {
    if (!prescription) return;
    
    if (!doctorName.trim()) {
      Alert.alert("Validation Error", "Doctor name is required.");
      return;
    }
    if (!patientName.trim()) {
      Alert.alert("Validation Error", "Patient name is required.");
      return;
    }
    if (medicines.length === 0) {
      Alert.alert("Validation Error", "At least one medicine is required.");
      return;
    }

    const hasEditingCard = medicines.some(m => m.isEditing);
    if (hasEditingCard) {
      Alert.alert("Unsaved Cards", "Please save all medicine cards before saving prescription changes.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        doctorName,
        hospitalName,
        prescriptionDate: date,
        patientName,
        diagnosis,
        medicines: medicines.map(({ id, isEditing, ...m }) => m),
        confidence: prescription.confidence,
        warnings: prescription.warnings || [],
        followUp: prescription.followUp || '',
        originalImageUri: prescription.originalImageUri || '',
        ocrText: prescription.ocrText || '',
        scanDate: prescription.scanDate,
      };

      const updated = await prescriptionService.updatePrescription(prescription.id, updatedData);
      if (updated) {
        setPrescription(updated);
        setIsEditing(false);
        Alert.alert("Success", "Prescription details updated successfully.");
      } else {
        throw new Error("Failed to save updates.");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save updates.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading record details...</Text>
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.errorTitle}>Record Not Found</Text>
        <Text style={styles.errorDescription}>This prescription record could not be located.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={isEditing ? () => setIsEditing(false) : () => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Prescription" : "Prescription Details"}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionBtn}
            onPress={isEditing ? handleSaveChanges : () => setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Save changes" : "Edit record"}
          >
            {isEditing ? (
              <CheckCircle size={22} color="#10B981" />
            ) : (
              <Edit3 size={22} color="#2563EB" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteHeaderButton}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete prescription record"
          >
            <Trash2 size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Confidence Banner */}
        <View style={styles.confidenceRow}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.confidenceText}>
            AI Scan Accuracy: <Text style={styles.confidenceValue}>{prescription.confidence}%</Text>
          </Text>
        </View>

        {/* Doctor & Hospital Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Prescribing Authority</Text>
          {isEditing ? (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder="Doctor Name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hospital / Clinic</Text>
                <TextInput
                  style={styles.textInput}
                  value={hospitalName}
                  onChangeText={setHospitalName}
                  placeholder="Hospital Name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prescription Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Doctor:</Text>
                <Text style={styles.infoValue}>{prescription.doctorName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hospital/Clinic:</Text>
                <Text style={styles.infoValue}>{prescription.hospitalName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prescription Date:</Text>
                <Text style={styles.infoValue}>{prescription.prescriptionDate}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Patient & Diagnosis details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Patient details</Text>
          {isEditing ? (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Patient Name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diagnosis/Reason</Text>
                <TextInput
                  style={styles.textInput}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Diagnosis"
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Patient Name:</Text>
                <Text style={styles.infoValue}>{prescription.patientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Diagnosis/Reason:</Text>
                <Text style={styles.infoValue}>{prescription.diagnosis || "Not specified"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Medicines List */}
        <Text style={styles.listSectionTitle}>Prescribed Medicines</Text>
        {medicines.map((med, index) => (
          <View key={med.id || index} style={styles.medicineCard}>
            {med.isEditing ? (
              // Edit Mode Card
              <View style={styles.editCardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.editingCardTitle}>Edit Medicine Info</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleEditMedicine(med.id)}
                    style={styles.closeEditButton}
                  >
                    <CheckCircle size={18} color="#15803D" />
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardInputGroup}>
                  <Text style={styles.cardInputLabel}>Medicine Name</Text>
                  <TextInput
                    style={styles.cardTextInput}
                    value={med.name}
                    onChangeText={(val) => handleUpdateMedicineField(med.id, 'name', val)}
                    placeholder="Medicine Name"
                  />
                </View>

                <View style={styles.gridRow}>
                  <View style={[styles.cardInputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.cardInputLabel}>Dosage</Text>
                    <TextInput
                      style={styles.cardTextInput}
                      value={med.dosage}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'dosage', val)}
                      placeholder="e.g. 1 tab"
                    />
                  </View>
                  <View style={[styles.cardInputGroup, { flex: 1 }]}>
                    <Text style={styles.cardInputLabel}>Frequency</Text>
                    <TextInput
                      style={styles.cardTextInput}
                      value={med.frequency}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'frequency', val)}
                      placeholder="e.g. Twice daily"
                    />
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={[styles.cardInputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.cardInputLabel}>Duration</Text>
                    <TextInput
                      style={styles.cardTextInput}
                      value={med.duration}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'duration', val)}
                      placeholder="e.g. 5 days"
                    />
                  </View>
                  <View style={[styles.cardInputGroup, { flex: 1 }]}>
                    <Text style={styles.cardInputLabel}>Strength</Text>
                    <TextInput
                      style={styles.cardTextInput}
                      value={med.strength}
                      onChangeText={(val) => handleUpdateMedicineField(med.id, 'strength', val)}
                      placeholder="e.g. 500mg"
                    />
                  </View>
                </View>

                <View style={styles.cardInputGroup}>
                  <Text style={styles.cardInputLabel}>Instructions</Text>
                  <TextInput
                    style={[styles.cardTextInput, { height: 50 }]}
                    value={med.instructions}
                    onChangeText={(val) => handleUpdateMedicineField(med.id, 'instructions', val)}
                    placeholder="Instructions"
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
                <View style={styles.medHeader}>
                  <Text style={styles.medName}>{med.name}</Text>
                  {med.strength ? (
                    <View style={styles.strengthBadge}>
                      <Text style={styles.strengthText}>{med.strength}</Text>
                    </View>
                  ) : null}
                </View>
                
                <View style={styles.medDetailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Dosage</Text>
                    <Text style={styles.detailValue}>{med.dosage || "As directed"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Frequency</Text>
                    <Text style={styles.detailValue}>{med.frequency || "N/A"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>{med.duration || "N/A"}</Text>
                  </View>
                </View>

                {med.instructions ? (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsLabel}>Instructions:</Text>
                    <Text style={styles.instructionsValue}>{med.instructions}</Text>
                  </View>
                ) : null}

                {/* Inline Card actions if editing the whole prescription */}
                {isEditing && (
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={[styles.cardActionBtn, styles.editCardBtn]}
                      onPress={() => handleToggleEditMedicine(med.id)}
                    >
                      <Text style={styles.editBtnText}>Edit Medicine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cardActionBtn, styles.deleteCardBtn]}
                      onPress={() => handleDeleteMedicine(med.id)}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Add Medicine Button (when editing) */}
        {isEditing && (
          <TouchableOpacity 
            style={styles.addMedicineButton}
            onPress={handleAddMedicine}
            activeOpacity={0.7}
          >
            <Plus size={20} color={COLORS.primaryBlue} />
            <Text style={styles.addMedicineText}>Add Medicine</Text>
          </TouchableOpacity>
        )}

        {/* Warnings Section */}
        {prescription.warnings && prescription.warnings.length > 0 && !isEditing && (
          <View style={styles.warningsCard}>
            <View style={styles.warningsHeader}>
              <AlertTriangle size={20} color="#D97706" style={styles.warningIcon} />
              <Text style={styles.warningsTitle}>Safety Warnings & Advisory</Text>
            </View>
            <View style={styles.warningList}>
              {prescription.warnings.map((warn: string, index: number) => (
                <Text key={index} style={styles.warningItem}>
                  • {warn}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Original Prescription Image Display */}
        {prescription.originalImageUri && !isEditing && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>Original Prescription Image</Text>
            <View style={styles.imageViewer}>
              <Image 
                source={{ uri: prescription.originalImageUri }}
                style={styles.scannedImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Accordion Raw OCR text */}
        {prescription.ocrText && !isEditing && (
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.accordionHeader}
              onPress={() => setIsOcrExpanded(!isOcrExpanded)}
              accessibilityRole="button"
              accessibilityLabel="Toggle raw extracted text"
            >
              <Text style={styles.accordionTitle}>Raw Extracted Text</Text>
              {isOcrExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
            </TouchableOpacity>
            {isOcrExpanded && (
              <View style={styles.accordionBody}>
                <Text style={styles.ocrText}>{prescription.ocrText}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Grid Action Footer buttons */}
      <View style={styles.footerActions}>
        {isEditing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.borderBtn, { flex: 1 }]} 
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <Text style={[styles.actionBtnText, styles.borderBtnText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { flex: 1.5, backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue }]} 
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.actionRow}>
              {/* Share */}
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Share2 size={20} color="#2563EB" style={styles.btnIcon} />
                <Text style={styles.actionBtnText}>Share Record</Text>
              </TouchableOpacity>
              
              {/* Add Reminder */}
              <TouchableOpacity style={styles.actionBtn} onPress={handleAddReminder}>
                <Bell size={20} color="#2563EB" style={styles.btnIcon} />
                <Text style={styles.actionBtnText}>Add Reminder</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.actionRow, { marginTop: 8 }]}>
              {/* Download PDF */}
              <TouchableOpacity style={[styles.actionBtn, styles.borderBtn]} onPress={handleDownloadPDF}>
                <FileDown size={20} color="#64748B" style={styles.btnIcon} />
                <Text style={[styles.actionBtnText, styles.borderBtnText]}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  deleteHeaderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 24,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  confidenceText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 6,
  },
  confidenceValue: {
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.secondaryText,
    flex: 0.35,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryText,
    textAlign: 'right',
    flex: 0.65,
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginTop: 8,
    marginBottom: 12,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    flex: 1,
    marginRight: 8,
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
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryText,
  },
  instructionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  instructionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 2,
  },
  instructionsValue: {
    fontSize: 12,
    color: COLORS.primaryText,
    lineHeight: 16,
  },
  warningsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  warningList: {
    gap: 6,
  },
  warningItem: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  imageViewer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedImage: {
    width: '100%',
    height: '100%',
  },
  noImageText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    paddingVertical: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  accordionBody: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  ocrText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  footerActions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  borderBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  borderBtnText: {
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 24,
  },
  backHomeBtn: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.primaryText,
    backgroundColor: '#F8FAFC',
  },
  editCardContent: {
    padding: 16,
    backgroundColor: '#FCFDFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  editingCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryText,
    textTransform: 'uppercase',
  },
  closeEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  cardInputGroup: {
    marginBottom: 10,
  },
  cardInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  cardTextInput: {
    height: 38,
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
  deleteCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    gap: 4,
  },
  deleteCardText: {
    fontSize: 11,
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
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 6,
  },
  addMedicineText: {
    color: COLORS.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 10,
  },
  cardActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
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
  editBtnText: {
    color: COLORS.primaryBlue,
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtnText: {
    color: COLORS.primaryRed,
    fontSize: 11,
    fontWeight: '600',
  },
  readCardContent: {
    padding: 0,
  },
});
