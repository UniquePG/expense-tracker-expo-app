import { ENDPOINTS } from '../constants/apiEndpoints';
import storage from '../utils/storage';
import axiosClient from './axiosClient';

export const userApi = {
  getProfile: async () => {
    const response = await axiosClient.get(ENDPOINTS.USERS.ME);
    if(response.success && response.data) {
      const {user} = response.data;
      await storage.setUserData(user);
    }
    return response;
  },
  updateProfile: async (data) => {
    const response = await axiosClient.put(ENDPOINTS.USERS.ME, data);
    return response;
  },
  uploadAvatar: async (formData) => {
    const response = await axiosClient.post(ENDPOINTS.USERS.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  deleteAvatar: async () => {
    const response = await axiosClient.delete(ENDPOINTS.USERS.AVATAR);
    return response;
  },
  searchUsers: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.USERS.SEARCH, { params });
    return response;
  },
  getUserById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.USERS.ID(id));
    return response;
  },
  deleteAccount: async () => {
    const response = await axiosClient.delete(ENDPOINTS.USERS.ME);
    return response;
  },
};

export default userApi;
