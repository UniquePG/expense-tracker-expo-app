import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const accountsApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.ACCOUNTS.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.ACCOUNTS.BASE, { params });
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.ACCOUNTS.ID(id));
    return response;
  },
  getBalance: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.ACCOUNTS.BALANCE(id));
    return response;
  },
  getTotalBalance: async () => {
    const response = await axiosClient.get(ENDPOINTS.ACCOUNTS.TOTAL);
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.ACCOUNTS.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.ACCOUNTS.ID(id));
    return response;
  },
};

export default accountsApi;
