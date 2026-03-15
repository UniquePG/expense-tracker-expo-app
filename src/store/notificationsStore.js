import {create} from 'zustand';
import {notificationsApi} from '../api/notificationsApi';

export const useNotificationsStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: null,

  // Actions
  fetchNotifications: async (page = 1) => {
    set({isLoading: true, error: null});
    try {
      const response = await notificationsApi.getNotifications(page);
      const newNotifications = page === 1
        ? response.data.notifications
        : [...get().notifications, ...response.data.notifications];
      
      set({
        notifications: newNotifications,
        unreadCount: response.data.unreadCount,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      });
      throw error;
    }
  },

  markAsRead: async notificationId => {
    try {
      await notificationsApi.markAsRead(notificationId);
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? {...n, read: true} : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set(state => ({
        notifications: state.notifications.map(n => ({...n, read: true})),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async notificationId => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: state.notifications.find(n => n.id === notificationId && !n.read)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  fetchSettings: async () => {
    try {
      const response = await notificationsApi.getSettings();
      set({settings: response.data});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  },

  updateSettings: async settings => {
    try {
      const response = await notificationsApi.updateSettings(settings);
      set({settings: response.data});
      return response.data;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  },

  addNotification: notification => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearError: () => set({error: null}),
}));