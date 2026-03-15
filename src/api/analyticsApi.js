import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const analyticsApi = {
  getDashboardData: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  getSpendingByCategory: async (startDate, endDate) => {
    const response = await axiosClient.get(
      API_ENDPOINTS.ANALYTICS.SPENDING_BY_CATEGORY,
      {
        params: {startDate, endDate},
      },
    );
    return response.data;
  },

  getIncomeVsExpense: async (startDate, endDate) => {
    const response = await axiosClient.get(
      API_ENDPOINTS.ANALYTICS.INCOME_VS_EXPENSE,
      {
        params: {startDate, endDate},
      },
    );
    return response.data;
  },

  getMonthlyTrends: async (months = 6) => {
    const response = await axiosClient.get(API_ENDPOINTS.ANALYTICS.MONTHLY_TRENDS, {
      params: {months},
    });
    return response.data;
  },

  getFriendBalances: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.ANALYTICS.FRIEND_BALANCES);
    return response.data;
  },
};