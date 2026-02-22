import { create } from 'domain';
import api from './axios';

export interface ExamRoom{
  roomNumber: number,
  name: string,
  benchesTotal: number,
  seatsPerBench: number,
  totalCapacity: number,
  location: string
}

export interface RoomRequest{
  roomNumber : number,
  name: string;
  benchesTotal: number;
  seatsPerBench: number;
  totalCapacity: number;
  location: string;
}

export interface Room{
  blackRoomNumber : number;
  blackRoomName : string;
}
export interface AssignAccessRequest  {
  blackRoomId: number;
  registerNumber: number;
}

export interface RoomAccessList {
  registerNumber : number;
  userName: string;
  blackRoomName : string;
}

export interface ValidationResult {
  allowed: boolean;
  message: string;
}
//-> blackroom Apis
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

  assignAccess: async (data: AssignAccessRequest ): Promise<void> => {
    await api.post('/v1/blackRoom/assign', data);
  },

  removeAccess: async (registerNumber: string, roomName: string): Promise<void> => {
  await api.delete(`/v1/blackRoom/remove/${registerNumber}/${encodeURIComponent(roomName)}`);
},


  getAccessList: async (): Promise<RoomAccessList[]> => {
    const response = await api.get('/v1/blackRoom/access-list');
    return response.data;
  },

  validateAccess: async (staffId: string, roomName: string): Promise<ValidationResult> => {
    const response = await api.get(`/rooms/validate/${staffId}/${roomName}`);
    return response.data;
  },

  logEntry: async (staffId: string, roomName: string): Promise<void> => {
    await api.post('/rooms/log-entry', { staffId, roomName });
  },


  //examRooms Apis

  getExamRooms: async (): Promise<ExamRoom[]> =>{
    const response = await api.get('/v1/examrooms');
    return response.data;
  },

  createExamRoom: async (
    data: RoomRequest
  ):   Promise<ExamRoom> => {
    const response = await api.post("/v1/examrooms/save" , data);
    return response.data;
  },


  updateExamRoom: async (
    roomId: number,
    data: RoomRequest
  ): Promise<ExamRoom> => {
    const response = await api.put(
      `/v1/examrooms/${roomId}`,
      data
    );
    return response.data;
  },

  deleteExamRoom: async (
    roomNumber: number
  ): Promise<void> => {
    await api.delete(`/v1/examrooms/${roomNumber}`);
  },
};
