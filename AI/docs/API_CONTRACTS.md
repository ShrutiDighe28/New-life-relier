# 🔌 LifeRelier AI API Contracts

Version: 1.0

Project: LifeRelier Healthcare Platform

---

# Purpose

This document defines the API contracts for all AI services used by the LifeRelier AI Assistant.

These contracts serve as the communication layer between:

- React Native Frontend
- ASP.NET Core Backend
- AI Services

---

# Authentication

All AI APIs require:

Authorization Header

Bearer JWT Token

Example:

Authorization: Bearer eyJhbGc...

---

# Base URL

/api/v1/ai

---

# 1. AI Chat API

Purpose:

General healthcare conversation.

Endpoint:

POST /api/v1/ai/chat

Request:

{
    "conversationId": "conv_001",
    "patientId": "patient_001",
    "message": "I have headache for 3 days",
    "language": "en"
}

Response:

{
    "success": true,
    "conversationId": "conv_001",
    "response": {
        "summary": "Headaches can have many causes.",
        "followUpQuestions": [
            "Do you have fever?",
            "How severe is the pain?"
        ],
        "recommendations": [
            "Stay hydrated",
            "Get sufficient rest"
        ],
        "emergency": false,
        "disclaimer": "Educational information only."
    }
}

---

# 2. Report Analysis API

Purpose:

Explain laboratory reports.

Endpoint:

POST /api/v1/ai/report-analysis

Request:

{
    "patientId": "patient_001",
    "reportId": "report_001"
}

Response:

{
    "summary": "Vitamin D is below normal range.",
    "abnormalValues": [
        {
            "parameter": "Vitamin D",
            "value": 18,
            "status": "Low"
        }
    ],
    "recommendations": [
        "Consult your doctor regarding supplementation."
    ]
}

---

# 3. Prescription Analysis API

Purpose:

Explain prescriptions.

Endpoint:

POST /api/v1/ai/prescription-analysis

Request:

{
    "patientId": "patient_001",
    "prescriptionId": "pres_001"
}

Response:

{
    "medicines": [
        {
            "name": "Paracetamol",
            "dosage": "500mg",
            "frequency": "Twice Daily"
        }
    ]
}

---

# 4. Medicine Information API

Purpose:

Provide medicine information.

Endpoint:

POST /api/v1/ai/medicine-info

Request:

{
    "medicineName": "Paracetamol"
}

Response:

{
    "name": "Paracetamol",
    "uses": [
        "Fever",
        "Pain Relief"
    ],
    "warnings": [
        "Do not exceed recommended dosage."
    ]
}

---

# 5. Symptom Guidance API

Purpose:

Provide educational symptom guidance.

Endpoint:

POST /api/v1/ai/symptom-guidance

Request:

{
    "symptoms": [
        "headache",
        "fatigue"
    ]
}

Response:

{
    "possibleCauses": [
        "Dehydration",
        "Lack of sleep"
    ],
    "recommendations": [
        "Drink water",
        "Get adequate rest"
    ],
    "emergency": false
}

---

# 6. Health Tip API

Purpose:

Daily health tips.

Endpoint:

GET /api/v1/ai/health-tip

Response:

{
    "tip": "Aim for at least 7 hours of sleep every night."
}

---

# 7. Recommendation API

Purpose:

Personalized recommendations.

Endpoint:

GET /api/v1/ai/recommendations/{patientId}

Response:

{
    "recommendations": [
        "Increase water intake.",
        "Book a Vitamin D follow-up test.",
        "Take a 30-minute walk daily."
    ]
}

---

# Standard Error Response

{
    "success": false,
    "errorCode": "AI_UNAVAILABLE",
    "message": "AI service temporarily unavailable."
}

---

# HTTP Status Codes

200 → Success

400 → Invalid Request

401 → Unauthorized

403 → Forbidden

404 → Resource Not Found

429 → Rate Limit Exceeded

500 → Internal Server Error

503 → AI Service Unavailable

---

# Rate Limits

AI Chat:
50 requests/hour

Report Analysis:
20 requests/hour

Prescription Analysis:
20 requests/hour

Health Tips:
100 requests/hour

---

# End of Document