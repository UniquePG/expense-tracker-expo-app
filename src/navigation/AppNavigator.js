import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { useAuthStore } from '../store/authStore';
// import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ExpenseDetailsScreen from '../screens/expenses/ExpenseDetailsScreen';
import AddExpenseScreen from '../screens/transactions/AddExpenseScreen';
import AddIncomeScreen from '../screens/transactions/AddIncomeScreen';
import TransactionDetailsScreen from '../screens/transactions/TransactionDetailsScreen';
import TransactionListScreen from '../screens/transactions/TransactionListScreen';
import SplitWizardScreen from '../screens/expenses/SplitWizardScreen';
import MainNavigator from './MainNavigator';
// import GroupDetailsScreen from '../screens/groups/GroupDetailScreen';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import CategoryBreakdownScreen from '../screens/analytics/CategoryBreakdownScreen';
import TrendsScreen from '../screens/analytics/TrendsScreen';
import AccountDetailScreen from '../screens/dashboard/AccountDetailScreen';
import AccountsListScreen from '../screens/dashboard/AccountsListScreen';
import AddAccountScreen from '../screens/dashboard/AddAccountScreen';
import EditAccountScreen from '../screens/dashboard/EditAccountScreen';
import AddFriendScreen from '../screens/friends/AddFriendScreen';
import FriendProfileScreen from '../screens/friends/FriendProfileScreen';
import FriendRequestsScreen from '../screens/friends/FriendRequestsScreen';
import FriendsListScreen from '../screens/friends/FriendsListScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import GroupDetailsScreen from '../screens/groups/GroupDetailsScreen';
import GroupMembersScreen from '../screens/groups/GroupMembersScreen';
import GroupSettingsScreen from '../screens/groups/GroupSettingsScreen';
import GroupsListScreen from '../screens/groups/GroupsListScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import CurrencySettingsScreen from '../screens/profile/CurrencySettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import SettleDebtScreen from '../screens/settlements/SettleDebtScreen';
import SettlementHistoryScreen from '../screens/settlements/SettlementHistoryScreen';
import SettlementsScreen from '../screens/settlements/SettlementsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            {/* <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> */}
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            
            {/* Transactions */}
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
            <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
            <Stack.Screen name="TransactionList" component={TransactionListScreen} />
            <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
            <Stack.Screen name="SplitWizard" component={SplitWizardScreen} />
            
            {/* Groups */}
            <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
            <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
            <Stack.Screen name="GroupsList" component={GroupsListScreen} />
            
            {/* Friends */}
            <Stack.Screen name="FriendsList" component={FriendsListScreen} />
            <Stack.Screen name="AddFriend" component={AddFriendScreen} />
            <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
            <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
            
            {/* Profile */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            
            {/* Settlements */}
            <Stack.Screen name="Settlements" component={SettlementsScreen} />
            <Stack.Screen name="SettleDebt" component={SettleDebtScreen} />
            <Stack.Screen name="SettlementHistory" component={SettlementHistoryScreen} />
            
            {/* Others */}
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Trends" component={TrendsScreen} />
            <Stack.Screen name="CategoryBreakdown" component={CategoryBreakdownScreen} />
            <Stack.Screen name="AccountsList" component={AccountsListScreen} />
            <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
            <Stack.Screen name="AddAccount" component={AddAccountScreen} />
            <Stack.Screen name="EditAccount" component={EditAccountScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
