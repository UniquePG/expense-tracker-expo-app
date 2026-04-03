import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const expensesApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.EXPENSES.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.EXPENSES.BASE, { params });
    return response;
  },
  getSummary: async () => {
    const response = await axiosClient.get(ENDPOINTS.EXPENSES.SUMMARY);
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.EXPENSES.ID(id));
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.EXPENSES.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.EXPENSES.ID(id));
    return response;
  },
  uploadReceipt: async (id, formData) => {
    const response = await axiosClient.post(ENDPOINTS.EXPENSES.RECEIPT(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  deleteImage: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.EXPENSES.IMAGE(id));
    return response;
  },
  getComments: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.EXPENSES.COMMENTS(id));
    return response;
  },
  addComment: async (id, text) => {
    const response = await axiosClient.post(ENDPOINTS.EXPENSES.COMMENTS(id), { text });
    return response;
  },
};

export default expensesApi;
