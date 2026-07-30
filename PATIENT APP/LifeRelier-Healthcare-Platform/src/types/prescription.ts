export interface Medicine {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionAnalysis {
  doctorName: string;
  hospitalName: string;
  patientName: string;
  date: string;
  diagnosis: string;
  medicines: Medicine[];
  warnings: string[];
  followUp: string;
  confidence: number;
}
