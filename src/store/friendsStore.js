import { create } from 'zustand';
import { friendsApi } from '../api';

const extractFriends = (response) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.friends)) return root.friends;
  if (Array.isArray(root?.data?.friends)) return root.data.friends;
  if (Array.isArray(root?.data)) return root.data;
  return [];
};

const extractRequests = (response) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.requests)) return root.requests;
  if (Array.isArray(root?.data?.requests)) return root.data.requests;
  if (Array.isArray(root?.incoming)) return root.incoming;
  if (Array.isArray(root?.data)) return root.data;
  return [];
};

export const useFriendsStore = create((set, get) => ({
  friends: [],
  balances: [],
  pendingRequests: [],
  requests: [],        // combined incoming + outgoing
  friendDetails: null,
  contacts: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getAll();
      set({ friends: extractFriends(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBalances: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getBalances();
      const root = response?.data ?? response;
      const balances = Array.isArray(root) ? root : root?.balances ?? root?.data ?? [];
      set({ balances, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getPendingRequests();
      set({ pendingRequests: extractRequests(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getRequests();
      set({ requests: extractRequests(response), isLoading: false });
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

  acceptFriendRequest: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      await friendsApi.acceptRequest(requestId);
      // Remove from requests list
      const updated = get().requests.filter((r) => r.id !== requestId);
      const updatedPending = get().pendingRequests.filter((r) => r.id !== requestId);
      set({ requests: updated, pendingRequests: updatedPending, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  rejectFriendRequest: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      await friendsApi.rejectRequest(requestId);
      const updated = get().requests.filter((r) => r.id !== requestId);
      const updatedPending = get().pendingRequests.filter((r) => r.id !== requestId);
      set({ requests: updated, pendingRequests: updatedPending, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    set({ isLoading: true, error: null });
    try {
      await friendsApi.remove(friendId);
      const updated = get().friends.filter((f) => {
        const person = f?.friend || f?.user || f;
        return person?.id !== friendId && f?.id !== friendId;
      });
      set({ friends: updated, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getFriendDetails: async (friendId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsApi.getById(friendId);
      const root = response?.data ?? response;
      const details = root?.friend || root?.data?.friend || root?.data || root;
      set({ friendDetails: details, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  blockFriend: async (friendId) => {
    set({ isLoading: true, error: null });
    try {
      await friendsApi.blockFriend?.(friendId);
      const updated = get().friends.filter((f) => {
        const person = f?.friend || f?.user || f;
        return person?.id !== friendId && f?.id !== friendId;
      });
      set({ friends: updated, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setFriends: (friends) => set({ friends }),
  setPendingRequests: (pendingRequests) => set({ pendingRequests }),
  setBalances: (balances) => set({ balances }),
  setFriendDetails: (friendDetails) => set({ friendDetails }),
}));

export default useFriendsStore;
