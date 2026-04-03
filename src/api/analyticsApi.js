import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const analyticsApi = {
  getDashboard: async () => {
    const response = await axiosClient.get(ENDPOINTS.ANALYTICS.DASHBOARD);
    return response;
  },
  getCategorySpending: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.ANALYTICS.CATEGORY, { params });
    return response;
  },
  getIncomeVsExpense: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.ANALYTICS.INCOME_VS_EXPENSE, { params });
    return response;
  },
  getMonthlyTrends: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.ANALYTICS.TRENDS, { params });
    return response;
  },
  getFriendBalances: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.ANALYTICS.FRIEND_BALANCES, { params });
    return response;
  },
};

export default analyticsApi;
