export interface AIResponse {
    success: boolean;
    response: string;
    emergency: boolean;
    recommendations: string[];
    followUpQuestions: string[];
}

export interface AIRequest {
    message: string;
}

// Physical phone + Expo Go -> use process.env.EXPO_PUBLIC_API_URL or fallback to PC local IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.22:60192/api/AI/chat";

export async function sendMessage(message: string): Promise<AIResponse> {
    try {
        console.log("Calling API:", API_URL);
        console.log("Sending message:", message);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                message
            } as AIRequest),
        });

        console.log("HTTP Status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AIResponse = await response.json();

        console.log("API Response:", data);

        return data;
    }
    catch (error) {
        console.error("Error communicating with AI service:", error);
        throw error;
    }
}