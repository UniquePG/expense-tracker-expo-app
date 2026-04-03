import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import Toast from 'react-native-toast-message';

export const useAuth = () => {
  const { user, accessToken, setAuth, logout: clearAuth } = useAuthStore();

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
      Toast.show({ type: 'success', text1: 'Login Successful' });
      return response.data;
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.response?.data?.message });
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
      Toast.show({ type: 'success', text1: 'Registration Successful' });
      return response.data;
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error.response?.data?.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      await clearAuth();
      Toast.show({ type: 'info', text1: 'Logged Out' });
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    login,
    register,
    logout,
  };
};

export default useAuth;
