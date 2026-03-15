import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FriendsListScreen} from '../screens/friends/FriendsListScreen';
import {AddFriendScreen} from '../screens/friends/AddFriendScreen';
import {FriendRequestsScreen} from '../screens/friends/FriendRequestsScreen';
import {FriendProfileScreen} from '../screens/friends/FriendProfileScreen';
import {SettlementsScreen} from '../screens/settlements/SettlementsScreen';
import {SettleDebtScreen} from '../screens/settlements/SettleDebtScreen';

const Stack = createNativeStackNavigator();

export const FriendsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="FriendsList" component={FriendsListScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
      <Stack.Screen name="Settlements" component={SettlementsScreen} />
      <Stack.Screen name="SettleDebt" component={SettleDebtScreen} />
    </Stack.Navigator>
  );
};