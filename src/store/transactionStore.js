import { create } from 'zustand';
import { transactionsApi } from '../api';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsApi.getAll(params);
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTransactionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsApi.getById(id);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsApi.create(data);
      set((state) => ({
        transactions: [response.data, ...state.transactions],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transactionsApi.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setTransactions: (transactions) => set({ transactions }),
}));

export default useTransactionStore;
