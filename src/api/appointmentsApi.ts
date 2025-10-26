import api from './axios';

export interface Appointment {
  id?: number;
  registerNumber: string;
  appointmentDate: string;
  purpose: string;
  status?: string;
  createdAt?: string;
}

export const appointmentsApi = {
  getByUser: async (registerNumber: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/user/${registerNumber}`);
    return response.data;
  },

  create: async (registerNumber: string, appointment: Omit<Appointment, 'id' | 'registerNumber'>): Promise<Appointment> => {
    const response = await api.post(`/appointments/${registerNumber}`, appointment);
    return response.data;
  },
};
