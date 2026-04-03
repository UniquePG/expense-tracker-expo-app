import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const requestCameraPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need camera permissions to scan receipts.');
    return false;
  }
  return true;
};

export const requestMediaLibraryPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need gallery permissions to upload images.');
    return false;
  }
  return true;
};
