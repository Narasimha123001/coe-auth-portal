import api from './axios';

export interface Appointment {
  id?: number;
  appointmentDateTime: string;
  createdDate?: string;  // Note: API returns "createdDate" not "createdAt"
  purpose: string;
  registrationNumber?: number;
  status?: string;
}

export const appointmentsApi = {
  getByUser: async (registerNumber: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/v1/appointments/my`);
      
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      
      // Handle empty responses
      if (response.status === 204 || !response.data) {
        return [];
      }
      
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If data is wrapped in a property
      if (response.data.appointments && Array.isArray(response.data.appointments)) {
        return response.data.appointments;
      }
      
      console.warn('Unexpected API response format:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Handle 404 or other errors gracefully
      if (error.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  },

getAll: async (): Promise<Appointment[]> => {
  try {
    const response = await api.get(`/v1/appointments`);

    if (response.status === 204 || !response.data) {
      return [];
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
},


  create: async (appointment: {
    appointmentDateTime: string;
    purpose: string;
  }) => {
     const response = await api.post(
      `/v1/appointments/book`,
      appointment
    );
    return response.data;
  },
};