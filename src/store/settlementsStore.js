import {create} from 'zustand';
import {settlementsApi} from '../api/settlementsApi';

export const useSettlementsStore = create((set, get) => ({
  // State
  settlements: [],
  currentSettlement: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },

  // Actions
  fetchSettlements: async (reset = false) => {
    const {pagination} = get();
    const page = reset ? 1 : pagination.page;

    if (!reset && !pagination.hasMore) return;

    set({isLoading: true, error: null});
    try {
      const response = await settlementsApi.getSettlements({page, limit: pagination.limit});
      
      const newSettlements = reset
        ? response.data.settlements
        : [...get().settlements, ...response.data.settlements];

      set({
        settlements: newSettlements,
        pagination: {
          ...pagination,
          page: page + 1,
          total: response.data.total,
          hasMore: newSettlements.length < response.data.total,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch settlements',
        isLoading: false,
      });
      throw error;
    }
  },

  createSettlement: async settlementData => {
    set({isLoading: true, error: null});
    try {
      const response = await settlementsApi.createSettlement(settlementData);
      set(state => ({
        settlements: [response.data, ...state.settlements],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create settlement',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({error: null}),
}));