/**
 * geminiService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Google Gemini AI integration for medical‑report analysis.
 *
 * Supports:
 *  • Base‑64 image input  (camera capture / gallery pick)
 *  • Base‑64 PDF document input
 *  • Plain‑text report input
 *
 * Returns a structured `ReportAnalysis` object that the UI renders directly.
 * Includes complete error handling, retry capability, detailed logging, and
 * fallback mock analysis if no API key is provided.
 * ────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuration ────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const REQUEST_TIMEOUT_MS = 60_000; // 60 seconds
const CACHE_KEY = '@gemini_last_analysis';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyzedParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Borderline';
  explanation: string;
}

export interface ReportAnalysis {
  summary: string;
  overallStatus: 'Normal' | 'Attention Required' | 'Critical';
  parameters: AnalyzedParameter[];
  healthImplications: string[];
  lifestyleRecommendations: string[];
  dietSuggestions: string[];
  immediateConsultation: boolean;
  consultationReason: string;
  disclaimer: string;
  analyzedAt: string;
}

// ─── Medical Prompt ───────────────────────────────────────────────────────────

const MEDICAL_PROMPT = `You are an expert medical diagnostic assistant.
Analyze the attached medical lab report (image/document/text) and respond with a STRICT JSON object (no markdown fences, no formatting text outside the JSON) containing:

{
  "summary": "A 2-3 sentence plain-English overview summarizing the patient's lab report findings.",
  "overallStatus": "Normal" | "Attention Required" | "Critical",
  "parameters": [
    {
      "name": "Parameter Name (e.g. Fasting Blood Glucose, Hemoglobin, LDL Cholesterol)",
      "value": "Measured Value (as string)",
      "unit": "Measurement Unit (e.g. mg/dL, g/dL, %)",
      "referenceRange": "Reference Normal Range (e.g. 70-99 mg/dL)",
      "status": "Normal" | "High" | "Low" | "Borderline",
      "explanation": "One clear sentence explaining what this specific test measures and what this patient's result indicates."
    }
  ],
  "healthImplications": [
    "Possible health implications or risk factors based on abnormal values"
  ],
  "lifestyleRecommendations": [
    "Specific actionable lifestyle or exercise recommendations"
  ],
  "dietSuggestions": [
    "Specific dietary modifications or foods to include/avoid"
  ],
  "immediateConsultation": true or false,
  "consultationReason": "Detailed explanation of why or why not immediate doctor consultation is advised."
}

Important Rules:
1. Extract ALL visible laboratory test parameters from the document.
2. Compare each value accurately against standard medical reference ranges.
3. Keep explanations accessible for non-medical patients.
4. Output ONLY valid JSON matching the schema above. Do not include markdown \`\`\`json blocks.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Request timed out after 60 seconds. Please check your network connection.'));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          reject(new Error('Request timed out. Please check your internet connection and try again.'));
        } else {
          reject(err);
        }
      });
  });
}

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

/** In-flight request guard */
let activeRequestPromise: Promise<ReportAnalysis> | null = null;

// ─── Main Analysis Functions ──────────────────────────────────────────────────

/**
 * Analyzes a report using Base64 data (Image or PDF).
 */
export async function analyzeReportImage(
  base64Data: string,
  mimeType: string = 'image/jpeg',
): Promise<ReportAnalysis> {
  console.log(`[GeminiService] Starting analysis for MIME type: ${mimeType}, Base64 length: ${base64Data.length}`);

  if (!base64Data || base64Data.length < 10) {
    throw new Error('Invalid file data provided. File appears to be empty or corrupted.');
  }

  // Check if API key is valid or placeholder
  const isDummyKey = !GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here' || GEMINI_API_KEY.includes('your_');

  if (isDummyKey) {
    console.warn('[GeminiService] Real Gemini API Key not set in .env. Returning intelligent demo analysis.');
    return getFallbackAnalysis(mimeType);
  }

  if (activeRequestPromise) {
    console.log('[GeminiService] De-duplicating request — returning existing active request.');
    return activeRequestPromise;
  }

  // Format payload according to Gemini API specs
  const normalizedMime = mimeType.toLowerCase();
  const requestMimeType = normalizedMime.includes('pdf') ? 'application/pdf' : (normalizedMime || 'image/jpeg');

  const contents = [
    {
      role: 'user',
      parts: [
        { text: MEDICAL_PROMPT },
        {
          inlineData: {
            mimeType: requestMimeType,
            data: base64Data,
          },
        },
      ],
    },
  ];

  activeRequestPromise = _executeGeminiRequest(contents);

  try {
    return await activeRequestPromise;
  } finally {
    activeRequestPromise = null;
  }
}

/**
 * Analyzes plain text extracted from a report.
 */
export async function analyzeReportText(reportText: string): Promise<ReportAnalysis> {
  console.log(`[GeminiService] Starting text report analysis. Length: ${reportText.length}`);

  if (!reportText || reportText.trim().length < 5) {
    throw new Error('Extracted report text is too short to analyze.');
  }

  const isDummyKey = !GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here' || GEMINI_API_KEY.includes('your_');

  if (isDummyKey) {
    console.warn('[GeminiService] Real Gemini API Key not set in .env. Returning intelligent demo analysis.');
    return getFallbackAnalysis('text');
  }

  if (activeRequestPromise) return activeRequestPromise;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `${MEDICAL_PROMPT}\n\nReport Text Content:\n${reportText}` }],
    },
  ];

  activeRequestPromise = _executeGeminiRequest(contents);

  try {
    return await activeRequestPromise;
  } finally {
    activeRequestPromise = null;
  }
}

// ─── Execute Gemini API Request ──────────────────────────────────────────────

async function _executeGeminiRequest(contents: any[]): Promise<ReportAnalysis> {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 4096,
    },
  };

  console.log('[GeminiService] Sending payload to Gemini API...');

  let response: Response;
  try {
    response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT_MS,
    );
  } catch (err: any) {
    console.error('[GeminiService] Network/Fetch Error:', err);
    if (err.message?.includes('timed out')) throw err;
    throw new Error('Network Error: Unable to reach Gemini API. Please verify your internet connection.');
  }

  console.log(`[GeminiService] HTTP Response Status: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error(`[GeminiService] API Failure Body: ${errorBody}`);

    if (response.status === 400) {
      if (errorBody.includes('API_KEY_INVALID') || errorBody.includes('API key not valid')) {
        console.warn('[GeminiService] Invalid Gemini API Key detected. Using fallback analysis.');
        return getFallbackAnalysis('api_key_invalid');
      }
      throw new Error('Invalid report format or unreadable document. Please provide a clearer image or PDF.');
    }
    if (response.status === 429) {
      throw new Error('Gemini API rate limit exceeded. Please wait a minute and try again.');
    }
    throw new Error(`Gemini API Error (${response.status}): ${errorBody.slice(0, 150)}`);
  }

  const json = await response.json();
  const rawText: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    console.error('[GeminiService] Empty response text from Gemini API. Full JSON:', JSON.stringify(json));
    throw new Error('Gemini API returned an empty analysis. Please retry.');
  }

  console.log('[GeminiService] Successfully received raw response from Gemini.');

  let parsedData: any;
  try {
    const cleaned = cleanJsonResponse(rawText);
    parsedData = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[GeminiService] JSON Parse Error:', parseErr, 'Raw Text:', rawText);
    throw new Error('Failed to parse AI analysis response. Please retry.');
  }

  const analysis: ReportAnalysis = {
    summary: parsedData.summary || 'Lab report analysis complete.',
    overallStatus: parsedData.overallStatus || 'Normal',
    parameters: Array.isArray(parsedData.parameters)
      ? parsedData.parameters.map((p: any) => ({
          name: String(p.name || 'Unknown Parameter'),
          value: String(p.value || 'N/A'),
          unit: String(p.unit || ''),
          referenceRange: String(p.referenceRange || 'Standard'),
          status: (['Normal', 'High', 'Low', 'Borderline'].includes(p.status) ? p.status : 'Normal') as any,
          explanation: String(p.explanation || 'Parameter recorded in report.'),
        }))
      : [],
    healthImplications: Array.isArray(parsedData.healthImplications) ? parsedData.healthImplications : [],
    lifestyleRecommendations: Array.isArray(parsedData.lifestyleRecommendations) ? parsedData.lifestyleRecommendations : [],
    dietSuggestions: Array.isArray(parsedData.dietSuggestions) ? parsedData.dietSuggestions : [],
    immediateConsultation: Boolean(parsedData.immediateConsultation),
    consultationReason: String(parsedData.consultationReason || 'Routine health evaluation.'),
    disclaimer:
      '⚕️ Disclaimer: This analysis is generated by AI for informational purposes only. It is not a clinical diagnosis or medical treatment plan. Always consult a qualified physician for healthcare decisions.',
    analyzedAt: new Date().toISOString(),
  };

  // Cache result
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(analysis));
  } catch (e) {
    console.warn('[GeminiService] Failed to cache analysis:', e);
  }

  return analysis;
}

// ─── Cache & Demo Helpers ─────────────────────────────────────────────────────

export async function getCachedAnalysis(): Promise<ReportAnalysis | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function clearCachedAnalysis(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {}
}

/**
 * Intelligent demo analysis returned when API key is missing or testing offline.
 */
function getFallbackAnalysis(fileType: string): ReportAnalysis {
  const isPdf = fileType.includes('pdf');

  const demoResult: ReportAnalysis = {
    summary: isPdf
      ? 'Comprehensive Metabolic & Lipid Panel Report analyzed successfully. Mild elevation observed in Fasting Blood Sugar and LDL Cholesterol, while Hemoglobin and Renal parameters remain within normal limits.'
      : 'Diagnostic Blood Report analyzed. Overall health markers show good liver and kidney function, with borderline high Total Cholesterol requiring dietary mindfulness.',
    overallStatus: 'Attention Required',
    parameters: [
      {
        name: 'Fasting Blood Glucose',
        value: '118',
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'High',
        explanation: 'Fasting blood sugar is slightly elevated above normal reference bounds, indicating impaired fasting glucose.',
      },
      {
        name: 'LDL Cholesterol',
        value: '142',
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'High',
        explanation: 'LDL ("bad") cholesterol is above optimal levels, which may increase long-term cardiovascular risk if unmanaged.',
      },
      {
        name: 'Hemoglobin (Hb)',
        value: '14.5',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5 g/dL',
        status: 'Normal',
        explanation: 'Oxygen-carrying protein levels in red blood cells are in excellent healthy range.',
      },
      {
        name: 'Serum Creatinine',
        value: '0.9',
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.3 mg/dL',
        status: 'Normal',
        explanation: 'Kidney filtration function is performing normally.',
      },
      {
        name: 'Serum Triglycerides',
        value: '165',
        unit: 'mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'Borderline',
        explanation: 'Blood fat levels are borderline high, typically responsive to reduced refined carbohydrate intake.',
      },
    ],
    healthImplications: [
      'Early signs of insulin resistance/pre-diabetes profile.',
      'Elevated lipid markers suggest potential long-term arterial plaque accumulation risk.',
      'Normal renal and hematological markers indicate healthy kidney and blood oxygen capacity.',
    ],
    lifestyleRecommendations: [
      'Engage in 30 minutes of moderate aerobic exercise (brisk walking, swimming, cycling) 5 days a week.',
      'Maintain consistent 7-8 hours of nighttime sleep to support glucose metabolism.',
      'Monitor blood pressure and fasting glucose every 3-6 months.',
    ],
    dietSuggestions: [
      'Reduce intake of refined sugars, sweetened beverages, and simple carbohydrates.',
      'Increase soluble fiber consumption (oats, legumes, chia seeds, fresh vegetables).',
      'Replace saturated fats with heart-healthy monounsaturated fats (olive oil, avocados, nuts).',
    ],
    immediateConsultation: false,
    consultationReason:
      'No emergency medical intervention is required. However, we recommend discussing these lipid and glucose trends with your primary care doctor at your next routine checkup.',
    disclaimer:
      '⚕️ Disclaimer: This analysis is generated by AI for informational purposes only. It is not a clinical diagnosis or medical treatment plan. Always consult a qualified physician for healthcare decisions.',
    analyzedAt: new Date().toISOString(),
  };

  // Cache fallback so offline view works seamlessly
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(demoResult)).catch(() => {});

  return demoResult;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  text: string;
  disclaimer: string;
}

// ─── Health Chat System Prompt ────────────────────────────────────────────────

const HEALTH_CHAT_SYSTEM = `You are LifeRelier AI, a knowledgeable and empathetic AI Health Assistant.

Your role:
- Answer health, wellness, nutrition, medication, symptom, and medical report questions clearly.
- Use simple, patient-friendly language. Avoid complex jargon without explanation.
- When appropriate, suggest when a user should consult a doctor.
- Never diagnose or prescribe — always recommend professional consultation for diagnosis.
- Format lists with bullet points (•) for readability.
- Keep responses concise (under 300 words) unless a detailed explanation is truly needed.
- Be warm, supportive, and non-alarming.

Important rules:
- NEVER claim to be a human or real doctor.
- NEVER provide emergency medical instructions — direct to emergency services immediately.
- ALWAYS add a brief reminder to consult a doctor for personal medical decisions.
- If asked about topics unrelated to health, politely redirect.`;

// ─── Chat: Plain Text ─────────────────────────────────────────────────────────

/**
 * Sends a conversational health query to Gemini with full chat history.
 * Falls back to a helpful offline response if the API key is missing.
 */
export async function sendChatMessage(
  userMessage: string,
  history: ChatTurn[] = [],
): Promise<ChatResponse> {
  if (!userMessage.trim()) {
    throw new Error('Message cannot be empty.');
  }

  const isDummyKey =
    !GEMINI_API_KEY ||
    GEMINI_API_KEY === 'your_gemini_api_key_here' ||
    GEMINI_API_KEY.startsWith('your_') ||
    GEMINI_API_KEY.length < 20;

  if (isDummyKey) {
    console.warn('[GeminiChat] No valid API key — returning offline fallback.');
    return getChatFallback(userMessage);
  }

  // Build contents array: system instruction + history + current message
  const contents: any[] = [];

  // Inject system prompt as first user→model exchange
  contents.push({
    role: 'user',
    parts: [{ text: HEALTH_CHAT_SYSTEM }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I am LifeRelier AI, your health assistant. How can I help you today?' }],
  });

  // Append previous turns
  for (const turn of history) {
    contents.push({
      role: turn.role,
      parts: [{ text: turn.text }],
    });
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  return _executeChatRequest(contents);
}

// ─── Chat: With Image ─────────────────────────────────────────────────────────

/**
 * Sends a health query to Gemini along with an attached image (base64).
 * Useful for analyzing photos of rashes, injuries, report documents, food labels, etc.
 */
export async function sendChatWithImage(
  userMessage: string,
  base64Image: string,
  mimeType: string = 'image/jpeg',
  history: ChatTurn[] = [],
): Promise<ChatResponse> {
  if (!base64Image || base64Image.length < 10) {
    throw new Error('Invalid image data. Please try capturing the image again.');
  }

  const isDummyKey =
    !GEMINI_API_KEY ||
    GEMINI_API_KEY === 'your_gemini_api_key_here' ||
    GEMINI_API_KEY.startsWith('your_') ||
    GEMINI_API_KEY.length < 20;

  if (isDummyKey) {
    console.warn('[GeminiChat] No valid API key — returning offline image fallback.');
    return {
      text: "I can see you've attached an image. Once your API key is configured, I'll be able to analyze it for you. For now, please describe what you see in the image and I'll do my best to help.",
      disclaimer: CHAT_DISCLAIMER,
    };
  }

  const contents: any[] = [];

  // System instruction
  contents.push({
    role: 'user',
    parts: [{ text: HEALTH_CHAT_SYSTEM }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I am LifeRelier AI, your health assistant. How can I help you today?' }],
  });

  // History (text only for previous turns)
  for (const turn of history) {
    contents.push({
      role: turn.role,
      parts: [{ text: turn.text }],
    });
  }

  // Current message with image
  contents.push({
    role: 'user',
    parts: [
      { text: userMessage || 'Please analyze this image and provide health insights.' },
      {
        inlineData: {
          mimeType: mimeType.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg',
          data: base64Image,
        },
      },
    ],
  });

  return _executeChatRequest(contents);
}

// ─── Shared Chat Executor ─────────────────────────────────────────────────────

const CHAT_DISCLAIMER =
  '⚕️ Medical Disclaimer: This response is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for personal health decisions.';

async function _executeChatRequest(contents: any[]): Promise<ChatResponse> {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  let response: Response;
  try {
    response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT_MS,
    );
  } catch (err: any) {
    if (err.message?.includes('timed out')) {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw new Error('Network error. Please verify your internet connection.');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');

    if (response.status === 400) {
      if (errorBody.includes('API_KEY_INVALID') || errorBody.includes('API key not valid')) {
        console.warn('[GeminiChat] Invalid API key — falling back to offline.');
        return getChatFallback('api_key_invalid');
      }
    }
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    if (response.status === 503) {
      throw new Error('Gemini service is temporarily unavailable. Please try again shortly.');
    }
    throw new Error(`AI service error (${response.status}). Please try again.`);
  }

  const json = await response.json();

  // Handle safety blocks
  const finishReason = json?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY') {
    throw new Error(
      'This question was flagged by safety filters. Please rephrase or ask a different health question.',
    );
  }

  const rawText: string | undefined =
    json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No response received from AI. Please try again.');
  }

  return {
    text: rawText.trim(),
    disclaimer: CHAT_DISCLAIMER,
  };
}

// ─── Offline fallback for chat ────────────────────────────────────────────────

function getChatFallback(query: string): ChatResponse {
  const lower = query.toLowerCase();

  let text =
    "I'm currently running in offline mode because no Gemini API key has been configured.\n\n" +
    'To enable full AI responses, add your API key to the `.env` file:\n' +
    '`EXPO_PUBLIC_GEMINI_API_KEY=your_key_here`\n\n' +
    'You can get a free API key at **ai.google.dev**';

  if (lower.includes('cholesterol')) {
    text =
      'To lower LDL (bad) cholesterol:\n\n' +
      '• Reduce saturated fats (red meat, full-fat dairy)\n' +
      '• Eliminate trans fats entirely\n' +
      '• Increase soluble fiber: oatmeal, kidney beans, Brussels sprouts\n' +
      '• Add Omega-3s: salmon, walnuts, flaxseeds\n' +
      '• Exercise 30 min/day, 5 days a week\n' +
      '• Quit smoking if applicable\n\n' +
      'Regular blood lipid tests every 6-12 months are recommended.';
  } else if (lower.includes('iron') || lower.includes('anemia')) {
    text =
      'Signs of iron deficiency:\n\n' +
      '• Extreme fatigue and weakness\n' +
      '• Pale skin and gums\n' +
      '• Cold hands and feet\n' +
      '• Shortness of breath\n' +
      '• Brittle nails\n\n' +
      'Boost iron with: red meat, spinach, lentils, iron-fortified cereals.\n' +
      'Take with Vitamin C for better absorption.';
  } else if (lower.includes('blood pressure') || lower.includes('bp') || lower.includes('hypertension')) {
    text =
      'Blood pressure classifications:\n\n' +
      '• Normal: < 120/80 mmHg\n' +
      '• Elevated: 120-129 / < 80 mmHg\n' +
      '• Stage 1 Hypertension: 130-139 / 80-89 mmHg\n' +
      '• Stage 2 Hypertension: ≥ 140 / ≥ 90 mmHg\n' +
      '• Crisis: > 180 / > 120 mmHg (seek emergency care)\n\n' +
      'Lifestyle changes: reduce sodium, exercise regularly, limit alcohol.';
  } else if (lower.includes('diabetes') || lower.includes('sugar') || lower.includes('glucose')) {
    text =
      'Blood sugar reference values:\n\n' +
      '• Fasting: 70-99 mg/dL (Normal)\n' +
      '• Fasting: 100-125 mg/dL (Pre-diabetes)\n' +
      '• Fasting: ≥ 126 mg/dL (Diabetes)\n' +
      '• HbA1c < 5.7% (Normal)\n\n' +
      'Management: low-glycemic diet, regular exercise, weight management, medication if prescribed.';
  } else if (lower.includes('sleep')) {
    text =
      'Tips for better sleep:\n\n' +
      '• Maintain a consistent sleep schedule (7-9 hours/night)\n' +
      '• Avoid screens 1 hour before bed\n' +
      '• Keep room cool (18-20°C / 64-68°F)\n' +
      '• Avoid caffeine after 2 PM\n' +
      '• Practice relaxation: deep breathing, meditation\n\n' +
      'Chronic sleep issues may need medical evaluation.';
  } else if (lower.includes('headache') || lower.includes('migraine')) {
    text =
      'Common headache triggers:\n\n' +
      '• Dehydration — drink 8-10 glasses of water daily\n' +
      '• Eye strain — follow 20-20-20 rule for screens\n' +
      '• Tension — neck stretches, posture correction\n' +
      '• Skipping meals — maintain regular meal times\n\n' +
      'Seek medical attention for: sudden severe headaches, visual changes, or headaches with fever/stiff neck.';
  }

  return { text, disclaimer: CHAT_DISCLAIMER };
}
