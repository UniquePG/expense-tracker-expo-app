import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TransactionListScreen} from '../screens/transactions/TransactionListScreen';
import {TransactionDetailsScreen} from '../screens/transactions/TransactionDetailsScreen';
import {AddExpenseScreen} from '../screens/transactions/AddExpenseScreen';
import {AddIncomeScreen} from '../screens/transactions/AddIncomeScreen';

const Stack = createNativeStackNavigator();

export const TransactionsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="TransactionList" component={TransactionListScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
    </Stack.Navigator>
  );
};