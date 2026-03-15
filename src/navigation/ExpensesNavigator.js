import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CreateExpenseScreen} from '../screens/expenses/CreateExpenseScreen';
import {ExpenseDetailsScreen} from '../screens/expenses/ExpenseDetailsScreen';
import {SplitExpenseScreen} from '../screens/expenses/SplitExpenseScreen';
import {EditExpenseScreen} from '../screens/expenses/EditExpenseScreen';

const Stack = createNativeStackNavigator();

export const ExpensesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="CreateExpense" component={CreateExpenseScreen} />
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
      <Stack.Screen name="SplitExpense" component={SplitExpenseScreen} />
      <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
    </Stack.Navigator>
  );
};