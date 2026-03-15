import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettlementsScreen} from '../screens/settlements/SettlementsScreen';
import {SettleDebtScreen} from '../screens/settlements/SettleDebtScreen';
import {SettlementHistoryScreen} from '../screens/settlements/SettlementHistoryScreen';

const Stack = createNativeStackNavigator();

export const SettlementsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Settlements" component={SettlementsScreen} />
      <Stack.Screen name="SettleDebt" component={SettleDebtScreen} />
      <Stack.Screen name="SettlementHistory" component={SettlementHistoryScreen} />
    </Stack.Navigator>
  );
};