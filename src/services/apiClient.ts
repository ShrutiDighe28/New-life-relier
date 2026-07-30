import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

const TOKEN_KEY = '@auth_token';

interface ApiOptions extends RequestInit {
  data?: any;
  params?: Record<string, string>;
  requireAuth?: boolean;
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { data, params, requireAuth = true, headers: customHeaders, ...customOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    // Attempt to parse JSON response
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (e.g., clear token, trigger logout)
        await clearAuthToken();
        // Event emitter could be used here to notify app to navigate to login
      }
      
      const errorMessage = responseData?.message || responseData?.error || 'An error occurred';
      throw new ApiError(response.status, responseData, errorMessage);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other generic errors
    throw new Error(error instanceof Error ? error.message : 'Network request failed');
  }
};

// Convenience methods
export const get = <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

export const post = <T>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', data });

export const put = <T>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', data });

export const del = <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
