import api from "./axios";

/* ---------------- TYPES ---------------- */

export interface Exam {
  examId?: number;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  createdBy?: string;
}

/* ---------------- EXAM APIS ---------------- */

export const examApi = {
  createExam: async (exam: Exam): Promise<Exam> => {
    const response = await api.post("/v1/exam/create", exam);
    return response.data;
  },

  getAllExams: async (): Promise<Exam[]> => {
    const response = await api.get("/v1/exam");
    return response.data;
  },

  updateExam: async (exam: Exam): Promise<Exam> => {
    const response = await api.put("/v1/exam/update", exam);
    return response.data;
  },

  deleteExam: async (id: number): Promise<void> => {
    await api.delete(`/v1/exam/${id}`);
  },
};
