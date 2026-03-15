import {create} from 'zustand';
import {analyticsApi} from '../api/analyticsApi';

export const useAnalyticsStore = create((set, get) => ({
  // State
  dashboardData: null,
  spendingByCategory: [],
  incomeVsExpense: [],
  monthlyTrends: [],
  friendBalances: [],
  isLoading: false,
  error: null,

  // Actions
  fetchDashboardData: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await analyticsApi.getDashboardData();
      set({dashboardData: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch dashboard data',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchSpendingByCategory: async (startDate, endDate) => {
    set({isLoading: true, error: null});
    try {
      const response = await analyticsApi.getSpendingByCategory(startDate, endDate);
      set({spendingByCategory: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch spending data',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchIncomeVsExpense: async (startDate, endDate) => {
    set({isLoading: true, error: null});
    try {
      const response = await analyticsApi.getIncomeVsExpense(startDate, endDate);
      set({incomeVsExpense: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch income vs expense',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMonthlyTrends: async months => {
    set({isLoading: true, error: null});
    try {
      const response = await analyticsApi.getMonthlyTrends(months);
      set({monthlyTrends: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch monthly trends',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFriendBalances: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await analyticsApi.getFriendBalances();
      set({friendBalances: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch friend balances',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({error: null}),
}));