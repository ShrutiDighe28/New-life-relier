import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api/apiConfig';
import { Prescription } from '../app/prescriptions/types';

const CURRENT_USER_KEY = '@current_user';

/**
 * Retrieves the logged-in patient ID from authentication context to query their history.
 */
async function getPatientId(): Promise<string> {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id || "demo-patient";
    }
  } catch (_) {}
  return "demo-patient";
}

/**
 * Shared service to manage prescription lifecycle (saving, history list, deletion)
 * backed by live ASP.NET Core SQL Server REST API endpoints.
 */
export const prescriptionService = {
  /**
   * Retrieves all saved prescriptions for the current session patient from backend SQL DB.
   */
  async getPrescriptions(): Promise<Prescription[]> {
    try {
      const patientId = await getPatientId();
      const response = await fetch(`${API_BASE_URL}/prescription/history/${patientId}`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data: Prescription[] = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get prescriptions from API:', error);
      return [];
    }
  },

  /**
   * Retrieves a single prescription by its unique ID from the backend SQL DB.
   */
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescription/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data: Prescription = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get prescription by id ${id} from API:`, error);
      return null;
    }
  },

  /**
   * Validates and saves a new prescription to the backend SQL DB.
   */
  async savePrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
    if (!prescriptionData.doctorName.trim()) {
      throw new Error('Doctor name is required.');
    }
    if (!prescriptionData.medicines || prescriptionData.medicines.length === 0) {
      throw new Error('Prescription must contain at least one medicine.');
    }

    try {
      const patientId = await getPatientId();
      // Ensure patientName matches context or fallback
      const patientName = prescriptionData.patientName || "Gauresh Shinde";
      
      const body = {
        ...prescriptionData,
        patientName
      };

      const response = await fetch(`${API_BASE_URL}/prescription/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned status: ${response.status}`);
      }

      const saved: Prescription = await response.json();
      return saved;
    } catch (error: any) {
      console.error('Failed to save prescription to API:', error);
      throw new Error(error.message || 'Failed to save prescription to database.');
    }
  },

  /**
   * Updates an existing prescription in the backend SQL DB.
   */
  async updatePrescription(id: string, prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
    if (!prescriptionData.doctorName.trim()) {
      throw new Error('Doctor name is required.');
    }
    if (!prescriptionData.medicines || prescriptionData.medicines.length === 0) {
      throw new Error('Prescription must contain at least one medicine.');
    }

    try {
      const patientName = prescriptionData.patientName || "Gauresh Shinde";
      const body = {
        ...prescriptionData,
        patientName
      };

      const response = await fetch(`${API_BASE_URL}/prescription/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned status: ${response.status}`);
      }

      const updated: Prescription = await response.json();
      return updated;
    } catch (error: any) {
      console.error(`Failed to update prescription ${id} in API:`, error);
      throw new Error(error.message || 'Failed to update prescription in database.');
    }
  },

  /**
   * Deletes a prescription by its unique ID from the backend SQL DB.
   */
  async deletePrescription(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescription/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete prescription ${id} from API:`, error);
      return false;
    }
  }
};
