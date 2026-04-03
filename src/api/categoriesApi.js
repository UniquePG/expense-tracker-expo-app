import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const categoriesApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.CATEGORIES.BASE, data);
    return response;
  },
  getAll: async () => {
    const response = await axiosClient.get(ENDPOINTS.CATEGORIES.BASE);
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.CATEGORIES.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.CATEGORIES.ID(id));
    return response;
  },
};

export default categoriesApi;
