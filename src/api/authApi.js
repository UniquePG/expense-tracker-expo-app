import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';
import storage from '../utils/storage';

export const authApi = {
  login: async (email, password) => {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    console.log("Login Response ", response.data.data)
    const {token, refreshToken, user} = response.data.data;
    await storage.setAuthToken(token);
    await storage.setRefreshToken(refreshToken);
    await storage.setUserData(user);
    return response.data;
  },

  register: async userData => {
    console.log('API_ENDPOINTS.AUTH.REGISTER :', API_ENDPOINTS.AUTH.REGISTER);
    console.log('userDataregister :', userData);
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await storage.clearAuthData();
    }
  },

  refreshToken: async () => {
    const refreshToken = await storage.getRefreshToken();
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });
    const {token, refreshToken: newRefreshToken} = response.data.data;
    await storage.setAuthToken(token);
    await storage.setRefreshToken(newRefreshToken);
    return response.data;
  },

  forgotPassword: async email => {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async token => {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
    return response.data;
  },
};