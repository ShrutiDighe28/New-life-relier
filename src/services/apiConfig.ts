import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns the base URL used for API calls.
 * In development we try to infer the machine's LAN IP so that a physical device can reach the server.
 * If that fails we fall back to the standard localhost / Android emulator addresses.
 */
const getBaseUrl = () => {
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(':')[0] : null;

    if (localhost) {
      return `http://${localhost}:8082/api`;
    }

    // Android emulator uses 10.0.2.2 to access localhost
    if (Platform.OS === 'android') {
      return "http://10.0.2.2:8082/api";
    }
    return "http://localhost:8082/api";
  }
  // Production endpoint (placeholder – replace with real URL when deploying).
  return "https://api.liferelier.com/api";
};

export const API_BASE_URL = getBaseUrl();
