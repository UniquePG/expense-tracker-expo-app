import { create } from 'zustand';
import { settlementsApi } from '../api';

export const useSettlementStore = create((set, get) => ({
  settlements: [],
  isLoading: false,
  error: null,

  fetchSettlements: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await settlementsApi.getAll(params);
      set({ settlements: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createSettlement: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await settlementsApi.create(data);
      set((state) => ({
        settlements: [response.data, ...state.settlements],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  confirmSettlement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await settlementsApi.confirm(id);
      set((state) => ({
        settlements: state.settlements.map((s) => s.id === id ? response.data : s),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

export default useSettlementStore;
