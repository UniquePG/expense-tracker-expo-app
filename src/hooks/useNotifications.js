import {useCallback, useEffect} from 'react';
import {useNotificationsStore} from '../store/notificationsStore';

export const useNotifications = (options = {}) => {
  const {autoFetch = true} = options;

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
    clearError,
  } = useNotificationsStore();

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch]);

  const refresh = useCallback(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const loadMore = useCallback((page) => {
    fetchNotifications(page);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
    clearError,
  };
};