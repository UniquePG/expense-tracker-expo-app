import { create } from 'zustand';
import { expensesApi, userApi, dashboardApi } from '../api';

export const useUserStore = create((set) => ({
  dashboardData: null,
  profile: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await dashboardApi.getSummary();
      set({ dashboardData: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await userApi.getProfile();
      set({ profile: response.data?.user || null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await userApi.updateProfile(data);
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  uploadAvatar: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await userApi.uploadAvatar(formData);
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setProfile: (profile) => set({ profile }),
}));

export default useUserStore;
