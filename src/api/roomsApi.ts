import { create } from 'domain';
import api from './axios';
import { access } from 'fs';


export interface Room{
  blackRoomNumber : number;
  blackRoomName : string;
}
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
  create: async (room: Room): Promise<Room> =>{
    const response = await api.post('/v1/blackRoom/add/room', room);
    return response.data;
  },
  update: async (room: Room): Promise<Room> =>{
    const response = await api.put('/blackRoom/update/room' , room);
    return response.data
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await api.get('/v1/blackRoom');
    return response.data;
  },

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
