import { create } from 'zustand';
import { expensesApi } from '../api';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchExpenses: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expensesApi.getAll(params);
      set({ expenses: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchExpenseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expensesApi.getById(id);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await expensesApi.getSummary();
      set({ summary: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expensesApi.create(data);
      set((state) => ({
        expenses: [response.data, ...state.expenses],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await expensesApi.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setExpenses: (expenses) => set({ expenses }),
}));

export default useExpenseStore;
