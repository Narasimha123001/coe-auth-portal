import api from "./axios";

/** ================= TYPES ================= */

export interface RoomsResponse {
  roomId: number[];
  date: string;
  sessionId: number[];
}

/** ================= SEAT APIs ================= */

export const seatApi = {
  /** Get rooms using date + slot */
  getRoomsByDateAndSlot: async (date: string, slotCode: string): Promise<RoomsResponse> => {
    const res = await api.get<RoomsResponse>(`/v1/seats/rooms`, {
      params: { date, slotCode },
    });
    return res.data;
  },

  /** Get seats using room + session */
  getSeatsByRoom: async (roomId: number, sessionId: number): Promise<number[]> => {
    const res = await api.get<number[]>(`/v1/seats/seats`, {
      params: { roomId, sessionId },
    });
    return res.data;
  },

  /** Get student register number using seat + session */
  getStudentBySeat: async (seatId: number, sessionId: number): Promise<number> => {
    const res = await api.get<number>(`/v1/seats/student`, {
      params: { seatId, sessionId },
    });
    return res.data;
  },
};