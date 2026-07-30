export interface ReportParameter {
    name: string;
    value: number | string;
    unit: string;
    refRange: string;
    status: "Normal" | "Borderline" | "High" | "Low";
    minNormal: number;
    maxNormal: number;
    currentValue: number;
}

export interface PatientInfo {
    name: string;
    id: string;
    age: number;
    gender: string;
    refDoctor: string;
    collectionDate: string;
    reportDate: string;
}

export interface ReportData {
    id: string;
    title: string;
    type: "Pathology" | "Radiology" | "Cardiology";
    date: string;
    day: string;
    month: string;
    year: string;
    labName: string;
    status: "Normal" | "Borderline" | "Review";
    icon: string; // MaterialCommunityIcons name
    image?: any;   // local require path if available
    patientInfo: PatientInfo;
    parameters?: ReportParameter[];
    findings?: string; // For Radiology / ECG
    aiInsights: string[];
    doctorNotes: string;
}

export const mockReports: ReportData[] = [
    {
        id: "cbc",
        title: "Complete Blood Count (CBC)",
        type: "Pathology",
        date: "20 May 2026",
        day: "20",
        month: "MAY",
        year: "2026",
        labName: "LifeRelier Pathology Lab",
        status: "Normal",
        icon: "flask-outline",
        image: require("@/assets/images/reports/cbc.png"),
        patientInfo: {
            name: "Rahul Sharma",
            id: "LR-2026-9842",
            age: 28,
            gender: "Male",
            refDoctor: "Dr. Sandeep Kumar, MD",
            collectionDate: "19 May 2026 08:30 AM",
            reportDate: "20 May 2026 02:45 PM"
        },
        parameters: [
            {
                name: "Hemoglobin",
                value: 14.5,
                unit: "g/dL",
                refRange: "13.0 - 17.0",
                status: "Normal",
                minNormal: 13.0,
                maxNormal: 17.0,
                currentValue: 14.5
            },
            {
                name: "White Blood Cells (WBC)",
                value: 7.2,
                unit: "10^3/µL",
                refRange: "4.0 - 11.0",
                status: "Normal",
                minNormal: 4.0,
                maxNormal: 11.0,
                currentValue: 7.2
            },
            {
                name: "Red Blood Cell (RBC)",
                value: 4.9,
                unit: "10^6/µL",
                refRange: "4.5 - 5.9",
                status: "Normal",
                minNormal: 4.5,
                maxNormal: 5.9,
                currentValue: 4.9
            },
            {
                name: "Platelet Count",
                value: 260,
                unit: "10^3/µL",
                refRange: "150 - 450",
                status: "Normal",
                minNormal: 150,
                maxNormal: 450,
                currentValue: 260
            },
            {
                name: "Hematocrit (PCV)",
                value: 42.1,
                unit: "%",
                refRange: "40.0 - 50.0",
                status: "Normal",
                minNormal: 40.0,
                maxNormal: 50.0,
                currentValue: 42.1
            }
        ],
        aiInsights: [
            "Your Hemoglobin levels are perfectly within the healthy range, supporting optimal oxygen transportation in your body.",
            "WBC and Platelets indicate a robust immune system and healthy clotting mechanism.",
            "Maintain your current balanced diet and stay well-hydrated to sustain these positive readings."
        ],
        doctorNotes: "All cell counts are normal. Patient shows no signs of anemia or infection. Clinically correlated."
    },
    {
        id: "lipid",
        title: "Lipid Profile",
        type: "Pathology",
        date: "18 May 2026",
        day: "18",
        month: "MAY",
        year: "2026",
        labName: "LifeRelier Pathology Lab",
        status: "Borderline",
        icon: "heart-pulse",
        image: require("@/assets/images/reports/lipid-profile.png"),
        patientInfo: {
            name: "Rahul Sharma",
            id: "LR-2026-9761",
            age: 28,
            gender: "Male",
            refDoctor: "Dr. Sandeep Kumar, MD",
            collectionDate: "17 May 2026 08:00 AM",
            reportDate: "18 May 2026 04:10 PM"
        },
        parameters: [
            {
                name: "Total Cholesterol",
                value: 215,
                unit: "mg/dL",
                refRange: "< 200 (Normal)",
                status: "Borderline",
                minNormal: 120,
                maxNormal: 200,
                currentValue: 215
            },
            {
                name: "HDL (Good) Cholesterol",
                value: 42,
                unit: "mg/dL",
                refRange: "> 40 (Normal)",
                status: "Normal",
                minNormal: 40,
                maxNormal: 60,
                currentValue: 42
            },
            {
                name: "LDL (Bad) Cholesterol",
                value: 138,
                unit: "mg/dL",
                refRange: "< 100 (Optimal)",
                status: "High",
                minNormal: 50,
                maxNormal: 100,
                currentValue: 138
            },
            {
                name: "Triglycerides",
                value: 145,
                unit: "mg/dL",
                refRange: "< 150 (Normal)",
                status: "Normal",
                minNormal: 80,
                maxNormal: 150,
                currentValue: 145
            }
        ],
        aiInsights: [
            "Your Total Cholesterol (215 mg/dL) is borderline elevated. It is recommended to limit high-fat foods.",
            "Bad Cholesterol (LDL) is at 138 mg/dL, which is above the optimal range of 100 mg/dL. Consider increasing cardiovascular exercises.",
            "Good Cholesterol (HDL) is stable. Adding foods rich in Omega-3 fatty acids (like walnuts, flaxseeds, fish) can help boost this further."
        ],
        doctorNotes: "Mild hypercholesterolemia. Dietary modifications and brisk walk for 30 minutes daily recommended. Repeat test in 3 months."
    },
    {
        id: "lft",
        title: "Liver Function Test (LFT)",
        type: "Pathology",
        date: "15 May 2026",
        day: "15",
        month: "MAY",
        year: "2026",
        labName: "LifeRelier Pathology Lab",
        status: "Normal",
        icon: "pill",
        patientInfo: {
            name: "Rahul Sharma",
            id: "LR-2026-9530",
            age: 28,
            gender: "Male",
            refDoctor: "Dr. Sandeep Kumar, MD",
            collectionDate: "14 May 2026 07:45 AM",
            reportDate: "15 May 2026 03:20 PM"
        },
        parameters: [
            {
                name: "ALT (SGPT)",
                value: 32,
                unit: "U/L",
                refRange: "7 - 56",
                status: "Normal",
                minNormal: 7,
                maxNormal: 56,
                currentValue: 32
            },
            {
                name: "AST (SGOT)",
                value: 27,
                unit: "U/L",
                refRange: "10 - 40",
                status: "Normal",
                minNormal: 10,
                maxNormal: 40,
                currentValue: 27
            },
            {
                name: "Total Bilirubin",
                value: 0.9,
                unit: "mg/dL",
                refRange: "0.2 - 1.2",
                status: "Normal",
                minNormal: 0.2,
                maxNormal: 1.2,
                currentValue: 0.9
            },
            {
                name: "Alkaline Phosphatase (ALP)",
                value: 82,
                unit: "U/L",
                refRange: "44 - 147",
                status: "Normal",
                minNormal: 44,
                maxNormal: 147,
                currentValue: 82
            },
            {
                name: "Albumin",
                value: 4.4,
                unit: "g/dL",
                refRange: "3.5 - 5.0",
                status: "Normal",
                minNormal: 3.5,
                maxNormal: 5.0,
                currentValue: 4.4
            }
        ],
        aiInsights: [
            "Your liver enzymes (SGPT/SGOT) are at optimal levels, indicating normal liver cell function and health.",
            "Bilirubin and Albumin markers indicate normal bile flow and standard protein synthesis capability of the liver.",
            "Continue avoiding excessive alcohol consumption and highly processed foods to maintain liver health."
        ],
        doctorNotes: "Hepatic panel is entirely within normal physiological limits. No therapeutic action required."
    },
    {
        id: "xray",
        title: "Chest X-Ray (PA View)",
        type: "Radiology",
        date: "12 May 2026",
        day: "12",
        month: "MAY",
        year: "2026",
        labName: "LifeRelier Imaging Center",
        status: "Normal",
        icon: "lungs",
        image: require("@/assets/images/reports/xray.png"),
        patientInfo: {
            name: "Rahul Sharma",
            id: "LR-2026-9488",
            age: 28,
            gender: "Male",
            refDoctor: "Dr. Sandeep Kumar, MD",
            collectionDate: "12 May 2026 11:00 AM",
            reportDate: "12 May 2026 01:15 PM"
        },
        findings: "LUNG FIELDS: Both lung fields are clear. No focal consolidation, collapse, effusion, or active parenchymal lesion is seen.\nHEART: The cardiothoracic ratio is normal. Cardiac silhouette is unremarkable.\nMEDIASTINUM: Hilum and mediastinal structures are normal in shape, size, and position.\nBONES & SOFT TISSUES: Bony thoracic cage and overlying chest wall soft tissues are unremarkable.\nDIAPHRAGM: Costophrenic and cardiophrenic angles are sharp and clear on both sides.",
        aiInsights: [
            "Your chest radiograph shows clear lung fields with no signs of active infections like pneumonia or bronchitis.",
            "The heart size and general cardiovascular contours are normal and proportionate.",
            "Diaphragm structures are sharp and normal, showing standard breathing mechanics."
        ],
        doctorNotes: "Normal chest radiograph. No acute cardiopulmonary pathology detected."
    },
    {
        id: "ecg",
        title: "Electrocardiogram (ECG / EKG)",
        type: "Cardiology",
        date: "10 May 2026",
        day: "10",
        month: "MAY",
        year: "2026",
        labName: "LifeRelier Cardiac Center",
        status: "Normal",
        icon: "heart-flash",
        image: require("@/assets/images/reports/ecg.png"),
        patientInfo: {
            name: "Rahul Sharma",
            id: "LR-2026-9210",
            age: 28,
            gender: "Male",
            refDoctor: "Dr. Sandeep Kumar, MD",
            collectionDate: "10 May 2026 09:30 AM",
            reportDate: "10 May 2026 10:00 AM"
        },
        findings: "HEART RATE: 72 beats per minute (bpm)\nRHYTHM: Regular Sinus Rhythm\nAXIS: Normal Axis (+45 degrees)\nINTERVALS:\n- PR Interval: 142 ms (Normal: 120-200ms)\n- QRS Duration: 88 ms (Normal: < 120ms)\n- QTc: 405 ms (Normal: < 440ms)\nST-T SEGMENT: No ST elevation, depression, or T-wave inversion noted.\nCHAMBER HYPERTROPHY: No evidence of atrial or ventricular hypertrophy.",
        aiInsights: [
            "Your heart rate is 72 bpm, which is in the ideal resting range (60-100 bpm) and the rhythm is regular.",
            "The electrical conduction pathways (PR, QRS, QTc intervals) are working properly.",
            "There are no signs of oxygen deprivation (ischemia) or structural changes in the heart muscles."
        ],
        doctorNotes: "Electrocardiogram represents normal sinus rhythm. No cardiac anomalies detected."
    }
];
