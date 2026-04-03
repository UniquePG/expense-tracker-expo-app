import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const transactionsApi = {
  createIncome: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.TRANSACTIONS.INCOME, data);
    return response;
  },
  createExpense: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.TRANSACTIONS.EXPENSE, data);
    return response;
  },
  createTransfer: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.TRANSACTIONS.TRANSFER, data);
    return response;
  },
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.TRANSACTIONS.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.TRANSACTIONS.BASE, { params });
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.TRANSACTIONS.ID(id));
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.TRANSACTIONS.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.TRANSACTIONS.ID(id));
    return response;
  },
};

export default transactionsApi;
