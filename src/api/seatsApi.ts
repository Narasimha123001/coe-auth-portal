import api from "./axios";

/** ================= TYPES ================= */

export interface RoomsResponse {
  roomId: number[];
  date: string;
  sessionId: number[];
}

export type SeatStatus = "ASSIGNED" | "PRESENT" | "ABSENT";

export interface SeatEntry {
  seatId: number;
  status: SeatStatus;
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

  /** Get seats with status using room + session */
  getSeatsByRoom: async (roomId: number, sessionId: number): Promise<SeatEntry[]> => {
    const res = await api.get<SeatEntry[]>(`/v1/seats/seats`, {
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

/** ================= INVIGILATOR APIs ================= */

export interface InvigilatorAssignment {
  roomId: number;
  date: string;
  slotCode: string;
  sessionIds: number[];
}

export const invigilatorApi = {
  /** Get the current invigilator's assignment for today */
  getMyAssignment: async (): Promise<InvigilatorAssignment> => {
    const res = await api.get<InvigilatorAssignment>(`/v1/invigilator/assignment`);
    return res.data;
  },

  /** Mark attendance for a student */
  markAttendance: async (
    roomId: number,
    studentId: number,
    sessionId: number,
  ): Promise<string> => {
    const res = await api.post<string>(`/v1/invigilator/attendance`, null, {
      params: { roomId, studentId, sessionId },
    });
    return res.data;
  },
};