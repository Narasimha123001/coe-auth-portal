import api from "./axios";

export interface Department {
  deptId?: number;
  code: string;
  name: string;
}

//-> department apis

export const departmentsApi = {

  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get("/v1/departments/list");
    return response.data;
  },

  createDepartment: async (department: Department): Promise<Department> => {
    const response = await api.post("/v1/departments", department);
    return response.data;
  },

  updateDepartment: async (
    code: string,
    department: Department
  ): Promise<Department> => {
    const response = await api.put(`/v1/departments/${code}`, department);
    return response.data;
  },

  deleteDepartment: async (code: string): Promise<void> => {
    await api.delete(`/v1/departments/${code}`);
  },

};