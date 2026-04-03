import { create } from 'zustand';
import { friendsApi } from '../api';

export const useFriendsStore = create((set, get) => ({
  friends: [],
  balances: null,
  pendingRequests: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getAll();
      set({ friends: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBalances: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getBalances();
      set({ balances: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getPendingRequests();
      set({ pendingRequests: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendFriendRequest: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await friendsApi.sendRequest(email);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setFriends: (friends) => set({ friends }),
  setPendingRequests: (pendingRequests) => set({ pendingRequests }),
  setBalances: (balances) => set({ balances }),
}));

export default useFriendsStore;
