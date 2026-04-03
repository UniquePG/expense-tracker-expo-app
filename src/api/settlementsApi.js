import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const settlementsApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.SETTLEMENTS.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.SETTLEMENTS.BASE, { params });
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.SETTLEMENTS.ID(id));
    return response;
  },
  confirm: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.SETTLEMENTS.CONFIRM(id));
    return response;
  },
  remind: async (id, data) => {
    const response = await axiosClient.post(ENDPOINTS.SETTLEMENTS.REMIND(id), data);
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.SETTLEMENTS.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.SETTLEMENTS.ID(id));
    return response;
  },
};

export default settlementsApi;
