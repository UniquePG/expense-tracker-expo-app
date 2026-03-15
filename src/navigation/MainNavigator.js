import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useNotificationsStore } from '../store/notificationsStore';

// Navigators
import { DashboardNavigator } from './DashboardNavigator';
import { FriendsNavigator } from './FriendsNavigator';
import { GroupsNavigator } from './GroupsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TransactionsNavigator } from './TransactionsNavigator';

// Screens that need to be accessible from multiple places
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const theme = useTheme();
  const {unreadCount} = useNotificationsStore();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'DashboardTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TransactionsTab':
              iconName = focused ? 'cash' : 'cash';
              break;
            case 'GroupsTab':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'FriendsTab':
              iconName = focused ? 'account-multiple' : 'account-multiple-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{title: 'Home'}}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsNavigator}
        options={{title: 'Transactions'}}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsNavigator}
        options={{title: 'Groups'}}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsNavigator}
        options={{title: 'Friends'}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Global screens accessible from anywhere */}
      <Stack.Screen 
        name="CreateExpense" 
        component={CreateExpenseScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
};