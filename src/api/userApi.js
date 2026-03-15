import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';
import storage from '../utils/storage';

export const userApi = {
  getCurrentUser: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  updateProfile: async userData => {
    const response = await axiosClient.put(API_ENDPOINTS.USERS.UPDATE, userData);
    await storage.setUserData(response.data.data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  uploadAvatar: async imageFile => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageFile.uri,
      type: imageFile.type,
      name: imageFile.fileName || 'avatar.jpg',
    });

    const response = await axiosClient.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await axiosClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT);
    return response.data;
  },

  searchUsers: async (query, page = 1, limit = 20) => {
    const response = await axiosClient.get(API_ENDPOINTS.USERS.SEARCH, {
      params: {q: query, page, limit},
    });
    return response.data;
  },
};