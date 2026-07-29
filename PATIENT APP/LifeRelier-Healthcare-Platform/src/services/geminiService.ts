import { PrescriptionAnalysis } from '@/types/prescription';
import { debugLogger } from '@/services/debugLogger';
import { API_BASE_URL } from '@/services/api/apiConfig';

/**
 * Sends prescription OCR text to the ASP.NET Core backend for analysis.
 * Backend will route the request to Gemini via the official Google AI SDK.
 */
export async function analyzePrescription(ocrText: string): Promise<PrescriptionAnalysis> {
  console.log('--------------------------------------------------');
  console.log('[DEBUG] EXACT OCR TEXT RECEIVED IN PIPELINE:');
  console.log(ocrText);
  console.log('--------------------------------------------------');

  const requestUrl = `${API_BASE_URL}/prescription/analyze`;
  const requestPayload = JSON.stringify({ ocrText });

  console.log('[DEBUG] SENDING POST REQUEST TO BACKEND ENDPOINT:');
  console.log(`URL: ${requestUrl}`);
  console.log(`Payload: ${requestPayload}`);
  console.log('--------------------------------------------------');

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestPayload,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend API returned status code ${response.status}: ${errText}`);
    }

    const validatedData: PrescriptionAnalysis = await response.json();

    console.log('[DEBUG] RECEIVED BACKEND RESPONSE:');
    console.log(JSON.stringify(validatedData, null, 2));
    console.log('--------------------------------------------------');

    // Save success logs to debug logger
    debugLogger.setLog({
      ocrText,
      geminiRequest: `POST ${requestUrl}\nPayload: ${requestPayload}`,
      geminiResponse: JSON.stringify(validatedData, null, 2),
      parsedJson: JSON.stringify(validatedData, null, 2),
      timestamp: new Date().toISOString()
    });

    return validatedData;
  } catch (error: any) {
    const errorMsg = error?.message || 'Backend processing exception.';
    console.error('[DEBUG] Backend request failed:', error);
    
    // Save failure details in debug logger
    debugLogger.setLog({
      ocrText,
      geminiRequest: `POST ${requestUrl}\nPayload: ${requestPayload}`,
      geminiResponse: `Exception: ${errorMsg}`,
      parsedJson: `{"error": "${errorMsg}"}`,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
}
