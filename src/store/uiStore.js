import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUIStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      isOffline: false,
      currentRoute: null,
      modals: {},
      toasts: [],

      // Actions
      setTheme: theme => set({theme}),
      toggleTheme: () => set(state => ({theme: state.theme === 'light' ? 'dark' : 'light'})),
      
      setOfflineStatus: isOffline => set({isOffline}),
      
      setCurrentRoute: route => set({currentRoute: route}),
      
      openModal: (modalId, data = null) => {
        set(state => ({
          modals: {...state.modals, [modalId]: {isOpen: true, data}},
        }));
      },

      closeModal: modalId => {
        set(state => ({
          modals: {...state.modals, [modalId]: {isOpen: false, data: null}},
        }));
      },

      addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        set(state => ({
          toasts: [...state.toasts, {id, message, type, duration}],
        }));
        
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      removeToast: id => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      },

      showSuccess: message => get().addToast(message, 'success'),
      showError: message => get().addToast(message, 'error'),
      showInfo: message => get().addToast(message, 'info'),
      showWarning: message => get().addToast(message, 'warning'),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({theme: state.theme}),
    },
  ),
);