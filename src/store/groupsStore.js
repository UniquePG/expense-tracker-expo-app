import { create } from 'zustand';
import { groupsApi } from '../api';

export const useGroupsStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  fetchGroups: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getAll(params);
      set({ groups: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getById(id);
      set({ currentGroup: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupMembers: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getMembers(id);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.create(data);
      set((state) => ({
        groups: [response.data, ...state.groups],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setGroups: (groups) => set({ groups }),
}));

export default useGroupsStore;
