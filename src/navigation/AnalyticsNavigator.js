import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AnalyticsScreen} from '../screens/analytics/AnalyticsScreen';
import {CategoryBreakdownScreen} from '../screens/analytics/CategoryBreakdownScreen';
import {TrendsScreen} from '../screens/analytics/TrendsScreen';

const Stack = createNativeStackNavigator();

export const AnalyticsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="CategoryBreakdown" component={CategoryBreakdownScreen} />
      <Stack.Screen name="Trends" component={TrendsScreen} />
    </Stack.Navigator>
  );
};