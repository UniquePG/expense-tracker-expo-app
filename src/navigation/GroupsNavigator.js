import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GroupsListScreen} from '../screens/groups/GroupsListScreen';
import {CreateGroupScreen} from '../screens/groups/CreateGroupScreen';
import {GroupDetailsScreen} from '../screens/groups/GroupDetailsScreen';
import {GroupMembersScreen} from '../screens/groups/GroupMembersScreen';
import {GroupSettingsScreen} from '../screens/groups/GroupSettingsScreen';

const Stack = createNativeStackNavigator();

export const GroupsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
    </Stack.Navigator>
  );
};