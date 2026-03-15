import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const expensesApi = {
  getExpenses: async (params = {}) => {
    const {page = 1, limit = 20, groupId, friendId, startDate, endDate, category} = params;
    const response = await axiosClient.get(API_ENDPOINTS.EXPENSES.LIST, {
      params: {page, limit, groupId, friendId, startDate, endDate, category},
    });
    return response.data;
  },

  createExpense: async expenseData => {
    const response = await axiosClient.post(API_ENDPOINTS.EXPENSES.CREATE, expenseData);
    return response.data;
  },

  getExpenseDetails: async expenseId => {
    const response = await axiosClient.get(API_ENDPOINTS.EXPENSES.DETAIL(expenseId));
    return response.data;
  },

  updateExpense: async (expenseId, expenseData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.EXPENSES.UPDATE(expenseId),
      expenseData,
    );
    return response.data;
  },

  deleteExpense: async expenseId => {
    const response = await axiosClient.delete(API_ENDPOINTS.EXPENSES.DELETE(expenseId));
    return response.data;
  },

  uploadReceipt: async (expenseId, imageFile) => {
    const formData = new FormData();
    formData.append('receipt', {
      uri: imageFile.uri,
      type: imageFile.type,
      name: imageFile.fileName || 'receipt.jpg',
    });

    const response = await axiosClient.post(
      API_ENDPOINTS.EXPENSES.UPLOAD_RECEIPT(expenseId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  updateSplit: async (expenseId, splitData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.EXPENSES.SPLIT(expenseId),
      splitData,
    );
    return response.data;
  },

  getComments: async expenseId => {
    const response = await axiosClient.get(API_ENDPOINTS.EXPENSES.COMMENTS(expenseId));
    return response.data;
  },

  addComment: async (expenseId, text) => {
    const response = await axiosClient.post(API_ENDPOINTS.EXPENSES.COMMENTS(expenseId), {
      text,
    });
    return response.data;
  },
};