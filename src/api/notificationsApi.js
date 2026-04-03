import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const notificationsApi = {
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return response;
  },
  getUnreadCount: async () => {
    const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD);
    return response;
  },
  markAsRead: async (notificationIds) => {
    const response = await axiosClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ, { notificationIds });
    return response;
  },
  markSingleAsRead: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.NOTIFICATIONS.ID_READ(id));
    return response;
  },
  markAllAsRead: async () => {
    const response = await axiosClient.post(ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.NOTIFICATIONS.ID(id));
    return response;
  },
  getSettings: async () => {
    const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.SETTINGS);
    return response;
  },
  updateSettings: async (data) => {
    const response = await axiosClient.put(ENDPOINTS.NOTIFICATIONS.SETTINGS, data);
    return response;
  },
};

export default notificationsApi;
