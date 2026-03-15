import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NotificationsScreen} from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();

export const NotificationsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};