import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../api/authApi';
import storage from '../utils/storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({isLoading: true, error: null});
        try {
          const response = await authApi.login(email, password);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async userData => {
        set({isLoading: true, error: null});
        try {
          console.log('userData :', userData);
          const response = await authApi.register(userData);
          console.log('response :', response);
          set({isLoading: false});
          return response;
        } catch (error) {
        console.log('error :', error);
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({isLoading: true});
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        const userData = await storage.getUserData();
        const token = await storage.getAuthToken();
        if (userData && token) {
          set({user: userData, isAuthenticated: true});
        }
      },

      updateUser: userData => {
        set({user: {...get().user, ...userData}});
      },

      clearError: () => set({error: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({user: state.user, isAuthenticated: state.isAuthenticated}),
    },
  ),
);