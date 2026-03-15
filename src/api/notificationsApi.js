import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: {page, limit},
    });
    return response.data;
  },

  markAsRead: async notificationId => {
    const response = await axiosClient.post(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },

  deleteNotification: async notificationId => {
    const response = await axiosClient.delete(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId),
    );
    return response.data;
  },

  getSettings: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);
    return response.data;
  },

  updateSettings: async settings => {
    const response = await axiosClient.put(
      API_ENDPOINTS.NOTIFICATIONS.SETTINGS,
      settings,
    );
    return response.data;
  },
};