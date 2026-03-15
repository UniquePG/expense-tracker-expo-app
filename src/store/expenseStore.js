import {create} from 'zustand';
import {expensesApi} from '../api/expensesApi';

export const useExpenseStore = create((set, get) => ({
  // State
  expenses: [],
  currentExpense: null,
  isLoading: false,
  isCreating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  filters: {
    groupId: null,
    friendId: null,
    startDate: null,
    endDate: null,
    category: null,
  },

  // Actions
  fetchExpenses: async (reset = false) => {
    const {pagination, filters} = get();
    const page = reset ? 1 : pagination.page;

    if (!reset && !pagination.hasMore) return;

    set({isLoading: true, error: null});
    try {
      const response = await expensesApi.getExpenses({
        page,
        limit: pagination.limit,
        ...filters,
      });

      const newExpenses = reset
        ? response.data.expenses
        : [...get().expenses, ...response.data.expenses];

      set({
        expenses: newExpenses,
        pagination: {
          ...pagination,
          page: page + 1,
          total: response.data.total,
          hasMore: newExpenses.length < response.data.total,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch expenses',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchExpenseDetails: async expenseId => {
    set({isLoading: true, error: null});
    try {
      const response = await expensesApi.getExpenseDetails(expenseId);
      set({currentExpense: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch expense details',
        isLoading: false,
      });
      throw error;
    }
  },

  createExpense: async expenseData => {
    set({isCreating: true, error: null});
    try {
      const response = await expensesApi.createExpense(expenseData);
      set(state => ({
        expenses: [response.data, ...state.expenses],
        isCreating: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create expense',
        isCreating: false,
      });
      throw error;
    }
  },

  updateExpense: async (expenseId, expenseData) => {
    set({isLoading: true, error: null});
    try {
      const response = await expensesApi.updateExpense(expenseId, expenseData);
      set(state => ({
        expenses: state.expenses.map(e => (e.id === expenseId ? response.data : e)),
        currentExpense: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update expense',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteExpense: async expenseId => {
    set({isLoading: true, error: null});
    try {
      await expensesApi.deleteExpense(expenseId);
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== expenseId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete expense',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSplit: async (expenseId, splitData) => {
    set({isLoading: true, error: null});
    try {
      const response = await expensesApi.updateSplit(expenseId, splitData);
      set(state => ({
        currentExpense: response.data,
        expenses: state.expenses.map(e => (e.id === expenseId ? response.data : e)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update split',
        isLoading: false,
      });
      throw error;
    }
  },

  uploadReceipt: async (expenseId, imageFile) => {
    try {
      const response = await expensesApi.uploadReceipt(expenseId, imageFile);
      set(state => ({
        currentExpense: state.currentExpense?.id === expenseId
          ? {...state.currentExpense, receipt: response.data.receipt}
          : state.currentExpense,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setFilters: newFilters => {
    set({filters: {...get().filters, ...newFilters}, pagination: {...get().pagination, page: 1, hasMore: true}});
  },

  clearFilters: () => {
    set({
      filters: {
        groupId: null,
        friendId: null,
        startDate: null,
        endDate: null,
        category: null,
      },
      pagination: {...get().pagination, page: 1, hasMore: true},
    });
  },

  clearCurrentExpense: () => set({currentExpense: null}),
  clearError: () => set({error: null}),
}));