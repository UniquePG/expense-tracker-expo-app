import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { authApi } from '../../api';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import InputField from '../../components/inputs/InputField';
import Button from '../../components/buttons/Button';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      Toast.show({ type: 'success', text1: 'Password changed successfully' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to change password', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Change Password" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <InputField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <InputField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <InputField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button 
          title="Update Password" 
          onPress={handleChangePassword} 
          loading={loading} 
          style={styles.button}
        />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  button: {
    marginTop: 24,
  },
});

export default ChangePasswordScreen;
