import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, Menu, Text, useTheme } from 'react-native-paper';
import { expensesApi } from '../../api/expensesApi';
import { friendsApi } from '../../api/friendsApi';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useFriends } from '../../hooks/useFriends';
import { formatCurrency } from '../../utils/formatCurrency';

export const FriendProfileScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const {removeFriend, getFriendBalance} = useFriends();
  const [friend, setFriend] = useState(null);
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const balance = getFriendBalance(id);

  useEffect(() => {
    fetchFriendData();
  }, [id]);

  const fetchFriendData = async () => {
    try {
      setIsLoading(true);
      const [friendResponse, expensesResponse] = await Promise.all([
        friendsApi.getFriendDetails(id),
        expensesApi.getExpenses({friendId: id, limit: 10}),
      ]);
      setFriend(friendResponse.data);
      setSharedExpenses(expensesResponse.data.expenses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load friend data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = useCallback(() => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend?.firstName} from your friends?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  }, [friend, id, removeFriend, navigation]);

  const handleSettleUp = () => {
    navigation.navigate('SettleDebt', {friendId: id});
  };

  const handleAddExpense = () => {
    navigation.navigate('CreateExpense', {friendId: id});
  };

  if (!friend) {
    return <LoadingOverlay visible={true} />;
  }

  const isOwed = balance?.amount > 0;
  const isSettled = !balance || balance.amount === 0;

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Friend Profile"
        onBack={() => navigation.goBack()}
        rightAction={
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Icon.Button
                name="dots-vertical"
                size={24}
                color={theme.colors.text}
                backgroundColor="transparent"
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item
              onPress={handleRemoveFriend}
              title="Remove Friend"
              leadingIcon="account-remove"
              titleStyle={{color: theme.colors.error}}
            />
          </Menu>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Avatar
            source={friend.avatar ? {uri: friend.avatar} : null}
            firstName={friend.firstName}
            lastName={friend.lastName}
            size={80}
          />
          <Text style={[styles.name, {color: theme.colors.text}]}>
            {friend.firstName} {friend.lastName}
          </Text>
          <Text style={[styles.email, {color: theme.colors.textSecondary}]}>
            {friend.email}
          </Text>
        </View>

        {!isSettled && (
          <Card style={[styles.balanceCard, {borderColor: isOwed ? theme.colors.income : theme.colors.expense}]}>
            <Text style={[styles.balanceLabel, {color: theme.colors.textSecondary}]}>
              {isOwed ? `${friend.firstName} owes you` : `You owe ${friend.firstName}`}
            </Text>
            <Text style={[
              styles.balanceAmount,
              {color: isOwed ? theme.colors.income : theme.colors.expense}
            ]}>
              {formatCurrency(Math.abs(balance?.amount || 0), balance?.currency)}
            </Text>
            
            {!isOwed && (
              <Button
                mode="contained"
                onPress={handleSettleUp}
                style={styles.settleButton}>
                Settle Up
              </Button>
            )}
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="cash-plus"
            onPress={handleAddExpense}
            style={styles.actionButton}>
            Add Expense
          </Button>
          <Button
            mode="outlined"
            icon="swap-horizontal"
            onPress={() => navigation.navigate('Settlements', {friendId: id})}
            style={styles.actionButton}>
            View Settlements
          </Button>
        </View>

        <Divider spacing={24} />

        <View style={styles.expensesSection}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Shared Expenses
          </Text>
          
          {sharedExpenses.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No shared expenses"
              message="You haven't shared any expenses with this friend yet"
              actionLabel="Add First Expense"
              onAction={handleAddExpense}
            />
          ) : (
            sharedExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => navigation.navigate('ExpenseDetails', {id: expense.id})}
              />
            ))
          )}
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  balanceCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settleButton: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  expensesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});