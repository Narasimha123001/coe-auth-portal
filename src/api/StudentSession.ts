import api from "./axios";

/* ---------------- TYPES ---------------- */

export interface StudentBulkRegisterRequest {
  sessionId: number;
  registrationIds: number[];
}

export interface StudentRegisterResponse {
  sessionId: number;
  registrationNo: number[];
  failed: number[];
}

/* ---------------- API ---------------- */

export const studentSessionApi = {

  getStudentsByYear: async (deptId: number |null,year: number | null): Promise<number[]> => {
    const res = await api.get(`/v1/student/list/${year}/deptId/${deptId}`);
    return res.data;
  },

  assignStudents: async (
    payload: StudentBulkRegisterRequest
  ): Promise<StudentRegisterResponse> => {
    const res = await api.post("/v1/studentSession/bulk", payload);
    return res.data;
  },
};