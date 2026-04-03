import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {STORAGE_KEYS} from '../constants/constants';


class Storage {
  // Generic AsyncStorage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async getItem(key) {
    try {
      if(!key) return ""
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Secure storage for sensitive data using Expo SecureStore
  async setSecureItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Error saving secure data:', error);
      return false;
    }
  }

  async getSecureItem(key) {
  // console.log('key :', key);
    try {
      if(!key) return ""
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading secure data:', error);
      return null;
    }
  }

  async removeSecureItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Error removing secure data:', error);
      return false;
    }
  }

  // Auth specific methods
  async setAuthToken(token) {
    return this.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken() {
    return this.getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken() {
    return this.removeSecureItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setRefreshToken(token) {
    return this.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  async getRefreshToken() {
    return this.getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async removeRefreshToken() {
    return this.removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setUserData(userData) {
    return this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  async getUserData() {
    return this.getItem(STORAGE_KEYS.USER_DATA);
  }

  async removeUserData() {
    return this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  async clearAuthData() {
    await Promise.all([
      this.removeAuthToken(),
      this.removeRefreshToken(),
      this.removeUserData(),
    ]);
  }
}

export default new Storage();
