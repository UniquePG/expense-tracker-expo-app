import {Alert, Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const requestCameraPermission = async () => {
  if (Platform.OS !== 'web') {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera permissions to make this work!');
      return false;
    }
  }
  return true;
};

export const requestMediaLibraryPermission = async () => {
  if (Platform.OS !== 'web') {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return false;
    }
  }
  return true;
};

export const requestNotificationPermission = async () => {
  // Expo Notifications permissions if needed
  return true;
};