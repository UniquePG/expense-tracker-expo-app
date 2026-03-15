import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, FAB, Menu, Text, useTheme } from 'react-native-paper';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { TabBar } from '../../components/ui/TabBar';
import { useGroups } from '../../hooks/useGroups';
import { formatCurrency } from '../../utils/formatCurrency';

const TABS = [
  {key: 'expenses', label: 'Expenses'},
  {key: 'balances', label: 'Balances'},
  {key: 'members', label: 'Members'},
];

export const GroupDetailsScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('expenses');
  const [menuVisible, setMenuVisible] = useState(false);
  
  const {
    currentGroup,
    groupExpenses,
    isLoading,
    fetchGroupDetails,
    fetchGroupExpenses,
    deleteGroup,
  } = useGroups();

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    await Promise.all([
      fetchGroupDetails(id),
      fetchGroupExpenses(id),
    ]);
  };

  const handleDeleteGroup = useCallback(() => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? All expenses will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  }, [id, deleteGroup, navigation]);

  const handleAddExpense = () => {
    navigation.navigate('CreateExpense', {groupId: id});
  };

  const handleAddMember = () => {
    navigation.navigate('GroupMembers', {id, mode: 'add'});
  };

  const renderExpensesTab = () => {
    if (groupExpenses.length === 0) {
      return (
        <EmptyState
          icon="receipt"
          title="No expenses yet"
          message="Add your first group expense to get started"
          actionLabel="Add Expense"
          onAction={handleAddExpense}
        />
      );
    }

    return (
      <FlatList
        data={groupExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <ExpenseCard
            expense={item}
            onPress={() => navigation.navigate('ExpenseDetails', {id: item.id})}
          />
        )}
        scrollEnabled={false}
      />
    );
  };

  const renderBalancesTab = () => {
    if (!currentGroup?.balances?.length) return null;

    return (
      <View style={styles.balancesContainer}>
        {currentGroup.balances.map(balance => (
          <Card key={balance.userId} style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Avatar
                source={balance.user.avatar ? {uri: balance.user.avatar} : null}
                firstName={balance.user.firstName}
                lastName={balance.user.lastName}
                size={40}
              />
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceName, {color: theme.colors.text}]}>
                  {balance.user.firstName} {balance.user.lastName}
                </Text>
                <Text style={[styles.balanceNet, {color: theme.colors.textSecondary}]}>
                  Paid: {formatCurrency(balance.paid)} | Owed: {formatCurrency(balance.owed)}
                </Text>
              </View>
              <Text
                style={[
                  styles.balanceAmount,
                  {
                    color: balance.net >= 0 ? theme.colors.income : theme.colors.expense,
                  },
                ]}>
                {balance.net >= 0 ? '+' : ''}{formatCurrency(balance.net)}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderMembersTab = () => {
    if (!currentGroup?.members?.length) return null;

    return (
      <View>
        {currentGroup.members.map(member => (
          <Card key={member.id} style={styles.memberCard}>
            <View style={styles.memberRow}>
              <Avatar
                source={member.avatar ? {uri: member.avatar} : null}
                firstName={member.firstName}
                lastName={member.lastName}
                size={48}
              />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, {color: theme.colors.text}]}>
                  {member.firstName} {member.lastName}
                </Text>
                <Text style={[styles.memberEmail, {color: theme.colors.textSecondary}]}>
                  {member.email}
                </Text>
              </View>
              {member.isAdmin && (
                <View style={[styles.adminBadge, {backgroundColor: theme.colors.primary}]}>
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>
          </Card>
        ))}
        
        <Button
          mode="outlined"
          icon="account-plus"
          onPress={handleAddMember}
          style={styles.addMemberButton}>
          Add Member
        </Button>
      </View>
    );
  };

  if (!currentGroup) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title={currentGroup.name}
        subtitle={`${currentGroup.members?.length || 0} members`}
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
              onPress={() => navigation.navigate('GroupSettings', {id})}
              title="Group Settings"
              leadingIcon="cog"
            />
            <Menu.Item
              onPress={handleDeleteGroup}
              title="Delete Group"
              leadingIcon="delete"
              titleStyle={{color: theme.colors.error}}
            />
          </Menu>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
                Total Expenses
              </Text>
              <Text style={[styles.summaryValue, {color: theme.colors.text}]}>
                {formatCurrency(currentGroup.totalExpenses || 0, currentGroup.currency)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
                Your Balance
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: (currentGroup.userBalance || 0) >= 0
                      ? theme.colors.income
                      : theme.colors.expense,
                  },
                ]}>
                {(currentGroup.userBalance || 0) >= 0 ? '+' : ''}
                {formatCurrency(currentGroup.userBalance || 0, currentGroup.currency)}
              </Text>
            </View>
          </View>
        </Card>

        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          style={styles.tabBar}
        />

        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'balances' && renderBalancesTab()}
        {activeTab === 'members' && renderMembersTab()}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={handleAddExpense}
        color="#FFFFFF"
      />

      <LoadingOverlay visible={isLoading && !currentGroup} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    marginBottom: 8,
  },
  balancesContainer: {
    padding: 16,
  },
  balanceCard: {
    marginBottom: 8,
    padding: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceNet: {
    fontSize: 12,
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  addMemberButton: {
    margin: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});