import { create } from 'zustand';
import { accountsApi } from '../api';

export const useAccountStore = create((set, get) => ({
  accounts: [],
  totalBalance: null,
  isLoading: false,
  error: null,

  fetchAccounts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountsApi.getAll(params);
      if(response?.success){
        set({ accounts: response.data?.accounts, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAccountById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountsApi.getById(id);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchTotalBalance: async () => {
    try {
      const response = await accountsApi.getTotalBalance();
      set({ totalBalance: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchAccountBalance: async (id) => {
    try {
      const response = await accountsApi.getBalance(id);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account balance', error);
      throw error;
    }
  },

  createAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountsApi.create(data);
      if(response?.success){
        const newAccount = response.data?.account;
        const previousaccounts = Array.isArray(get().accounts) ? get().accounts : [];
        set({
          accounts: [newAccount, ...previousaccounts],
          isLoading: false,
        });
      }
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAccount: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountsApi.update(id, data);
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? response.data : a)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await accountsApi.delete(id);
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setAccounts: (accounts) => set({ accounts }),
}));

export default useAccountStore;
