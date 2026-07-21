import { get } from './apiClient';

export interface DashboardResponse {
  user: any;
  healthScore: any;
  upcomingAppointment: any;
  recentReport: any;
  quickStats: any;
  healthInsights: any[];
  notifications: any[];
  emergencyCard: any;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    return get<DashboardResponse>('/dashboard');
  }
};
