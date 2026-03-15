import {create} from 'zustand';
import {userApi} from '../api/userApi';
import {useAuthStore} from './authStore';

export const useUserStore = create((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  updateSuccess: false,

  // Actions
  fetchProfile: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await userApi.getCurrentUser();
      set({profile: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProfile: async userData => {
    set({isLoading: true, error: null, updateSuccess: false});
    try {
      const response = await userApi.updateProfile(userData);
      set({
        profile: response.data,
        isLoading: false,
        updateSuccess: true,
      });
      // Update auth store user as well
      useAuthStore.getState().updateUser(response.data);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  uploadAvatar: async imageFile => {
    set({isLoading: true, error: null});
    try {
      const response = await userApi.uploadAvatar(imageFile);
      set(state => ({
        profile: {...state.profile, avatar: response.data.avatar},
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to upload avatar',
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({isLoading: true, error: null});
    try {
      const response = await userApi.changePassword(currentPassword, newPassword);
      set({isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to change password',
        isLoading: false,
      });
      throw error;
    }
  },

  clearUpdateSuccess: () => set({updateSuccess: false}),
  clearError: () => set({error: null}),
}));