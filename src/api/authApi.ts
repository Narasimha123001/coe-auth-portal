import api from './axios';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  registerNumber: number;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  registerNumber?: string;
}

export interface RegisterResponse {
  message: string;
  userId?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<string> => {
    const response = await api.post('/v1/auth/authenticate', credentials);
    return response.data; // response.data is the token string
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await api.post('/v1/auth/register', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token') ;
    localStorage.removeItem('user');
  },
};
