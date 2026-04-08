import api from "./axios";

/** ================= SEAT APIs ================= */

export interface SeatRoomResponse {
  rooms: number[];
  date: string;
  sessionId: number | null;
}

export const seatApi = {

  /** ✅ Get rooms using date + slot */
  getRoomsByDateAndSlot: (date: string, slotCode: string) =>
    api.get<SeatRoomResponse>(`/v1/seats/rooms`, {
      params: { date, slotCode },
    }),

  /** ✅ Get seats using room + session */
  getSeatsByRoom: (roomId: number, sessionId: number) =>
    api.get<number[]>(`/v1/seats/seats`, {
      params: { roomId, sessionId },
    }),

  /** ✅ Get student using seat + session */
  getStudentBySeat: (seatId: number, sessionId: number) =>
    api.get<number>(`/v1/seats/student`, {
      params: { seatId, sessionId },
    }),
};