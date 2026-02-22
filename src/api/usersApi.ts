import api from "./axios";

export interface User {
  id?: number;
  registerNumber: number;
  email: string;
  password?: string;
  role: string;
  name?: string;
}
export interface Student {
  registerNo: number;
  name?: string;
  email: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
}

export interface StudentProfile {
  registerNo: number;
  name: string;
  email: string;
  departmentName: string;
  year: number;
  phoneNo: string;
  semester: number;
}

export interface Subject {
  subjectCode: string;
  title: string;
}

export interface StudentSubjectsResponse {
  email: string;
  subjects: Subject[];
}
export interface StaffRespone {
  registerNumber: number;
  name: String;
}

export const usersApi = {
  getAllStaff: async (): Promise<StaffRespone[]> => {
    const response = await api.get("/v1/staff");
    return response.data;
  },

  getAll: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<Student>> => {

    const response = await api.get<PageResponse<Student>>(
      `/v1/student/all?page=${page}&size=${size}`
    );

    return response.data;
  }
  ,

  create: async (user: User): Promise<User> => {
    const response = await api.post("/users/register", user);
    return response.data;
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getStudentProfile: async (): Promise<StudentProfile> => {
    const response = await api.get("/v1/student/me");
    return response.data;
  },

  getStudentSubjects: async (): Promise<StudentSubjectsResponse> => {
    const response = await api.get("/v1/student/subjects");
    return response.data;
  },
};
