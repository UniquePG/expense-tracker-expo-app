import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUserStore } from '../../store/userStore';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import InputField from '../../components/inputs/InputField';
import Button from '../../components/buttons/Button';
import Avatar from '../../components/ui/Avatar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const { profile, updateProfile, uploadAvatar, isLoading } = useUserStore();
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleUpdate = async () => {
    try {
      await updateProfile({ firstName, lastName, phone });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    }
  };

  const handleAvatarPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        await uploadAvatar(formData);
        Alert.alert('Success', 'Avatar updated');
      } catch (error) {
        Alert.alert('Error', 'Upload failed');
      }
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Edit Profile" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          <Avatar source={profile?.avatar} name={`${profile?.firstName} ${profile?.lastName}`} size={100} />
          <View style={styles.editBadge}>
            <Button icon="camera" size={20} type="primary" style={styles.badgeButton} />
          </View>
        </TouchableOpacity>

        <InputField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <InputField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <InputField
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Button 
          title="Save Changes" 
          onPress={handleUpdate} 
          loading={isLoading} 
          style={styles.saveButton}
        />
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  badgeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
  },
  saveButton: {
    marginTop: 24,
    width: '100%',
  },
});

export default EditProfileScreen;
