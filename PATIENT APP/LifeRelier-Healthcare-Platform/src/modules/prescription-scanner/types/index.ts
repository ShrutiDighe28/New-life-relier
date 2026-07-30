import { LucideIcon } from 'lucide-react-native';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  icon?: LucideIcon;
  isLoading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export interface HeroProps {
  title?: string;
  subtitle?: string;
  /** Future-proofing: State of the OCR/AI analysis process */
  analysisState?: 'idle' | 'scanning' | 'analyzing' | 'completed' | 'error';
  /** Future-proofing: Overall confidence score of the AI extraction */
  confidenceScore?: number;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Future-proofing: Required AI capabilities for this feature */
  capabilities?: ('ocr' | 'nlp' | 'vision')[];
  isActive?: boolean;
}

export interface UploadOption {
  id: 'camera' | 'gallery' | 'document';
  title: string;
  icon: LucideIcon;
  onSelect: () => void;
  /** Future-proofing: Specific formats supported by the OCR engine */
  supportedFormats?: string[];
  maxFileSizeMB?: number;
}

export interface SecurityCardProps {
  title?: string;
  description?: string;
  /** Future-proofing: Healthcare compliance flags */
  hipaaCompliant?: boolean;
  endToEndEncryption?: boolean;
  dataRetentionDays?: number;
}

// --- Future-Proofing: OCR and AI Integration Types ---

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  rawText: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
}

export interface ParsedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  confidenceScore: number;
}

export interface PatientDetails {
  name?: string;
  age?: number;
  gender?: string;
}

export interface DoctorDetails {
  name?: string;
  registrationNumber?: string;
  contact?: string;
}

export interface AIAnalysisResult {
  id: string;
  timestamp: string;
  ocrResult: OCRResult;
  medicines: ParsedMedicine[];
  patientDetails?: PatientDetails;
  doctorDetails?: DoctorDetails;
  warnings?: string[];
  overallConfidence: number;
}
