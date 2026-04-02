import { create } from "domain";
import api from "./axios";
import ExamSessions from "@/pages/admin/ExamSession";

/* ---------------- TYPES ---------------- */

export interface Exam {
  examId?: number;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  createdBy?: string;
}

export interface createExamSession{
  examId?: number;
  sessionId?: number;
  subjectCode:string;
  partno?: number;
  date: string;
  slotCode: string,
  year:number,
  startTime: string;
  endTime: string;
  partNo?: number,
}

export interface ExamSession{
  examId?: number;
  sessionId?: number;
  subject_title:string;
  subject_code:string;
  partno?: number;
  date: string;
  slotCode: string,
  year:number,
  startTime: string;
  endTime: string;
  partNo?: number,
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

  /*--Exam Session --*/

  export const examSessionApi ={

    createExamSession: async (createExamSession: createExamSession): Promise<createExamSession> => {
      const response = await api.post("/v1/examSessions", createExamSession)
      return response.data;
    },
    getAllExamSession: async(examId: number): Promise<ExamSession[]> =>{
      const response = await api.get(`/v1/examSessions/examId/${examId}`);
      return response.data;
    }
    
  };
