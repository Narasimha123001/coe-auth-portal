import { jwtDecode } from 'jwt-decode';

export interface DecodedStudentToken {
  registerNo?: number;
  registerNumber?: string;
  name?: string;
  email?: string;
  departmentName?: string;
  year?: number;
  semester?: number;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token from localStorage
 */
export const getDecodedToken = (): DecodedStudentToken | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = jwtDecode<DecodedStudentToken>(token);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Extract student details from token
 */
export const getStudentDetailsFromToken = (): DecodedStudentToken | null => {
  return getDecodedToken();
};

/**
 * Normalize student data from token (handle both registerNo and registerNumber)
 */
export const normalizeStudentData = (data: DecodedStudentToken) => {
  return {
    registerNo: data.registerNo || parseInt(data.registerNumber || '0'),
    name: data.name || '',
    email: data.email || '',
    departmentName: data.departmentName || '',
    year: data.year || 0,
    semester: data.semester || 0,
  };
};
