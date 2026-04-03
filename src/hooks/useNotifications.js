import { useEffect } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';

export const useNotifications = (params) => {
  const { notifications, unreadCount, isLoading, error, fetchNotifications, fetchUnreadCount, markAsRead } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications(params);
    fetchUnreadCount();
  }, [JSON.stringify(params)]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
};

export default useNotifications;
