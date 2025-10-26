import api from './axios';

export interface User {
  id?: number;
  registerNumber: string;
  email: string;
  password?: string;
  role: string;
  name?: string;
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
};
