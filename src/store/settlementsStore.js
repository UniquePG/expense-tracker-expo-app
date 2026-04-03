import { create } from 'zustand';
import { settlementsApi } from '../api';

export const useSettlementsStore = create((set, get) => ({
  settlements: { sent: [], received: [] },
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
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  confirmSettlement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await settlementsApi.confirm(id);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setSettlements: (settlements) => set({ settlements }),
}));

export default useSettlementsStore;
