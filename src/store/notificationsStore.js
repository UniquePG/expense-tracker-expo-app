import { create } from 'zustand';
import { notificationsApi } from '../api';

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationsApi.getAll(params);
      set({ notifications: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  markAsRead: async (ids) => {
    try {
      await notificationsApi.markAsRead(ids);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - ids.length),
      }));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  },

  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount: unreadCount.unreadCount || unreadCount }),
}));

export default useNotificationsStore;
