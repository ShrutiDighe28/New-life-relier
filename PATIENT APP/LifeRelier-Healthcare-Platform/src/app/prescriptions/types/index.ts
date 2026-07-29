export interface Medicine {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  hospitalName: string;
  patientName: string;
  diagnosis: string;
  prescriptionDate: string;
  scanDate: string;
  medicines: Medicine[];
  warnings: string[];
  confidence: number;
  originalImageUri: string;
  ocrText: string;
  followUp: string;
  createdAt: string;
  updatedAt: string;
}
