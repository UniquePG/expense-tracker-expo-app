import {create} from 'zustand';
import {transactionsApi} from '../api/transactionsApi';

export const useTransactionStore = create((set, get) => ({
  // State
  transactions: [],
  categories: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  filters: {
    type: null,
    category: null,
    startDate: null,
    endDate: null,
  },

  // Actions
  fetchTransactions: async (reset = false) => {
    const {pagination, filters} = get();
    const page = reset ? 1 : pagination.page;

    if (!reset && !pagination.hasMore) return;

    set({isLoading: true, error: null});
    try {
      const response = await transactionsApi.getTransactions({
        page,
        limit: pagination.limit,
        ...filters,
      });

      const newTransactions = reset
        ? response.data.transactions
        : [...get().transactions, ...response.data.transactions];

      set({
        transactions: newTransactions,
        pagination: {
          ...pagination,
          page: page + 1,
          total: response.data.total,
          hasMore: newTransactions.length < response.data.total,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCategories: async type => {
    try {
      const response = await transactionsApi.getCategories(type);
      set({categories: response.data});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  createTransaction: async transactionData => {
    set({isLoading: true, error: null});
    try {
      const response = await transactionsApi.createTransaction(transactionData);
      set(state => ({
        transactions: [response.data, ...state.transactions],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create transaction',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({error: null}),
}));