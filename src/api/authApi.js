import { ENDPOINTS } from '../constants/apiEndpoints';
import storage from '../utils/storage';
import axiosClient from './axiosClient';

export const authApi = {
  register: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.REGISTER, data);
    console.log('response register :', response);
    if (response.success && response.data) {
        const {token, refreshToken, user} = response.data;
        console.log('token, refreshToken, user :', token, refreshToken, user);
        await storage.setAuthToken(token);
        await storage.setRefreshToken(refreshToken);
        await storage.setUserData(user);
        return response;
      }
    return response;
  },
  login: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, data);
    if (response.success && response.data) {
        const {token, refreshToken, user} = response.data;
        console.log('token, refreshToken, user :', token, refreshToken, user);
        await storage.setAuthToken(token);
        await storage.setRefreshToken(refreshToken);
        await storage.setUserData(user);
        return response;
      }
    return response;
  },
  refreshToken: async (refreshToken) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response;
  },
  logout: async (refreshToken) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    return response;
  },
  changePassword: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response;
  },
  forgotPassword: async (email) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response;
  },
  resetPassword: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response;
  },
  logoutAll: async () => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.LOGOUT_ALL);
    return response;
  },
};

export default authApi;
