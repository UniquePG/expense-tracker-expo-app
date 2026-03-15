import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export const ImagePickerField = ({
  label,
  value,
  onChange,
  error,
  style,
  placeholder = 'Tap to add photo',
}) => {
  const theme = useTheme();

  const requestPermission = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return false;
    }
    return true;
  };

  const handlePress = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
        });
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraPress = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permission');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: asset.fileName || `camera_${Date.now()}.jpg`,
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      
      {value ? (
        <View style={styles.imageContainer}>
          <Image source={{uri: value.uri}} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}>
            <Icon name="close-circle" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={handlePress}
            style={[styles.pickerButton, {borderColor: theme.colors.border}]}>
            <Icon
              name="image"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={[styles.pickerText, {color: theme.colors.primary}]}>
              Gallery
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleCameraPress}
            style={[styles.pickerButton, {borderColor: theme.colors.border}]}>
            <Icon
              name="camera"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={[styles.pickerText, {color: theme.colors.primary}]}>
              Camera
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
});