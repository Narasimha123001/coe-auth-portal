import api from './axios';

export interface User {
  id?: number;
  registerNumber: string;
  email: string;
  password?: string;
  role: string;
  name?: string;
}

export interface StudentProfile {
  registerNo: number;
  name: string;
  email: string;
  departmentName: string;
  year: number;
  semester: number;
}


export interface Subject{
  subjectCode : string;
  title: string;
}

export interface StudentSubjectsResponse{

  email: string;
  subjects: Subject[];
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (user: User): Promise<User> => {
    const response = await api.post('/users/register', user);
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
    const response = await api.get('/v1/student/me');
    return response.data;
  },


  getStudentSubjects: async (): Promise<StudentSubjectsResponse> => {
  const response = await api.get('/v1/student/subjects');
  return response.data;
},

};
