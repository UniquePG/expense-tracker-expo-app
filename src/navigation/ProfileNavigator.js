import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {ChangePasswordScreen} from '../screens/profile/ChangePasswordScreen';
import {NotificationSettingsScreen} from '../screens/profile/NotificationSettingsScreen';
import {CurrencySettingsScreen} from '../screens/profile/CurrencySettingsScreen';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} />
    </Stack.Navigator>
  );
};