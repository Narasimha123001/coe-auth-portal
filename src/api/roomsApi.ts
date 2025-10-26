import api from './axios';

export interface RoomAccess {
  staffId: string;
  roomName: string;
}

export interface RoomAccessList {
  staffId: string;
  staffName?: string;
  roomName: string;
}

export interface ValidationResult {
  allowed: boolean;
  message: string;
}

export const roomsApi = {
  assignAccess: async (access: RoomAccess): Promise<void> => {
    await api.post('/rooms/assign', access);
  },

  removeAccess: async (staffId: string, roomName: string): Promise<void> => {
    await api.delete(`/rooms/remove/${staffId}/${roomName}`);
  },

  getAccessList: async (): Promise<RoomAccessList[]> => {
    const response = await api.get('/rooms/access-list');
    return response.data;
  },

  validateAccess: async (staffId: string, roomName: string): Promise<ValidationResult> => {
    const response = await api.get(`/rooms/validate/${staffId}/${roomName}`);
    return response.data;
  },

  logEntry: async (staffId: string, roomName: string): Promise<void> => {
    await api.post('/rooms/log-entry', { staffId, roomName });
  },
};
