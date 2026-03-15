import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const transactionsApi = {
  getTransactions: async (params = {}) => {
    const {page = 1, limit = 20, type, category, startDate, endDate} = params;
    const response = await axiosClient.get(API_ENDPOINTS.TRANSACTIONS.LIST, {
      params: {page, limit, type, category, startDate, endDate},
    });
    return response.data;
  },

  createTransaction: async transactionData => {
  console.log('transactionData api:',API_ENDPOINTS.TRANSACTIONS.CREATE, transactionData);
    const response = await axiosClient.post(
      API_ENDPOINTS.TRANSACTIONS.CREATE,
      transactionData,
    );
    return response.data;
  },

  getTransactionDetails: async transactionId => {
    const response = await axiosClient.get(
      API_ENDPOINTS.TRANSACTIONS.DETAIL(transactionId),
    );
    return response.data;
  },

  updateTransaction: async (transactionId, transactionData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.TRANSACTIONS.UPDATE(transactionId),
      transactionData,
    );
    return response.data;
  },

  deleteTransaction: async transactionId => {
    const response = await axiosClient.delete(
      API_ENDPOINTS.TRANSACTIONS.DELETE(transactionId),
    );
    return response.data;
  },

  getCategories: async type => {
    const response = await axiosClient.get(API_ENDPOINTS.TRANSACTIONS.CATEGORIES, {
      params: {type},
    });
    return response.data;
  },
};