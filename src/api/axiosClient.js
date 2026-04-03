import axios from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';
import storage from '../utils/storage';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
  console.log('config :', config.baseURL, config.url);
    const token = await storage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) =>{
    console.log('BaseURL: ',response.config.url, 'response.data :', response.data);
   
   return response.data

  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token: accessToken, refreshToken: newRefreshToken } = response.data.data;
        console.log('accessToken, refreshToken: newRefreshToken :', accessToken, newRefreshToken);
             await storage.setAuthToken(accessToken);
        if (newRefreshToken) {
          await storage.setRefreshToken(newRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Handle logout or redirect to login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
