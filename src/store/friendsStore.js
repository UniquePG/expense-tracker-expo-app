import {create} from 'zustand';
import {friendsApi} from '../api/friendsApi';

export const useFriendsStore = create((set, get) => ({
  // State
  friends: [],
  friendRequests: [],
  balances: [],
  isLoading: false,
  error: null,

  // Actions
  fetchFriends: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await friendsApi.getFriends();
      set({friends: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch friends',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFriendRequests: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await friendsApi.getFriendRequests();
      set({friendRequests: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch requests',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchBalances: async () => {
    try {
      const response = await friendsApi.getBalances();
      set({balances: response.data});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  },

  sendFriendRequest: async email => {
    set({isLoading: true, error: null});
    try {
      const response = await friendsApi.sendFriendRequest(email);
      set({isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to send request',
        isLoading: false,
      });
      throw error;
    }
  },

  acceptFriendRequest: async requestId => {
    set({isLoading: true, error: null});
    try {
      await friendsApi.acceptFriendRequest(requestId);
      set(state => ({
        friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        isLoading: false,
      }));
      // Refresh friends list
      get().fetchFriends();
      get().fetchBalances();
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to accept request',
        isLoading: false,
      });
      throw error;
    }
  },

  rejectFriendRequest: async requestId => {
    set({isLoading: true, error: null});
    try {
      await friendsApi.rejectFriendRequest(requestId);
      set(state => ({
        friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to reject request',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFriend: async friendId => {
    set({isLoading: true, error: null});
    try {
      await friendsApi.removeFriend(friendId);
      set(state => ({
        friends: state.friends.filter(f => f.id !== friendId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to remove friend',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({error: null}),
}));