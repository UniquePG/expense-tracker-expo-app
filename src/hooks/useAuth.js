import {useEffect, useCallback} from 'react';
import {useAuthStore} from '../store/authStore';
import {useUserStore} from '../store/userStore';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
  } = useAuthStore();

  const {fetchProfile} = useUserStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // console.log('isAuthenticated :', isAuthenticated);
    // console.log('user :', user);
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const handleLogin = useCallback(async (email, password) => {
    try {
      await login(email, password);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [login]);

  const handleRegister = useCallback(async userData => {
    try {
      await register(userData);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [register]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};