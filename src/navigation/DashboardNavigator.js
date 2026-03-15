import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DashboardScreen} from '../screens/dashboard/DashboardScreen';
import {AnalyticsScreen} from '../screens/analytics/AnalyticsScreen';
import {CategoryBreakdownScreen} from '../screens/analytics/CategoryBreakdownScreen';
import {TrendsScreen} from '../screens/analytics/TrendsScreen';
import { AddIncomeScreen } from '@/screens/transactions/AddIncomeScreen';
import { AddExpenseScreen } from '@/screens/transactions/AddExpenseScreen';
import { CreateGroupScreen } from '@/screens/groups/CreateGroupScreen';

const Stack = createNativeStackNavigator();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="CategoryBreakdown" component={CategoryBreakdownScreen} />
      <Stack.Screen name="Trends" component={TrendsScreen} />
      <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
    </Stack.Navigator>
  );
};