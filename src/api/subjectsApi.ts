import api from "./axios";

/* ---------------- TYPES ---------------- */

export interface Subject {
  title: string;
  year: number;
  semester: number;
  subjectCode: string;
}

/* ---------------- SUBJECT APIS ---------------- */

export const subjectsApi = {

  // Get subjects by department
  getSubjectsByDepartment: async (deptId: number): Promise<Subject[]> => {
    const response = await api.get(`/v1/subjects/subject/${deptId}`);
    return response.data;
  },

};