import axios from 'axios';
import Constants from 'expo-constants';
import storage from '../utils/storage';
import {STORAGE_KEYS} from '../constants/constants';

// Get API URL from Expo extra config or fallback
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.0.180:4000';
// console.log('API_BASE_URL :', API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  async config => {
    const token = await storage.getAuthToken();
    // console.log('token :', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("(BEFORE) config url: ", config?.method, config?.url)
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosClient.interceptors.response.use(
  response => {
    console.log("Api respose: ", response.data) 
  return response
  },
  async error => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });
        
        const {token, refreshToken: newRefreshToken} = response.data.data;
        
        await storage.setAuthToken(token);
        await storage.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Clear auth data and redirect to login
        await storage.clearAuthData();
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  },
);

export default axiosClient;