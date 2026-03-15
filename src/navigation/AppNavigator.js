import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';
import {useUIStore} from '../store/uiStore';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';
import {LoadingOverlay} from '../components/ui/LoadingOverlay';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const {isAuthenticated, isLoading, loadUser} = useAuthStore();
  const {theme} = useUIStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};