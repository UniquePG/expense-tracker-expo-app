import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useExpenses } from '../../hooks/useExpenses';
import { useGroups } from '../../hooks/useGroups';
;

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId, title } = route.params;
  const [activeTab, setActiveTab] = useState('Expenses');
  const [refreshing, setRefreshing] = useState(false);
  
  const { getGroupDetails, groupDetails, isLoading: groupLoading } = useGroups();
  const { fetchExpenses, expenses, isLoading: expensesLoading } = useExpenses();

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        getGroupDetails(groupId),
        fetchExpenses({ groupId })
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load group details');
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const BalanceItem = ({ member }) => (
    <View style={styles.balanceItem}>
      <Avatar source={member.avatar} name={member.name} size={40} radius={20} />
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceName}>{member.name}</Text>
        <Text style={[
          styles.balanceAmount, 
          { color: member.balance >= 0 ? colors.success : colors.error }
        ]}>
          {member.balance >= 0 ? 'is owed' : 'owes'} ${Math.abs(member.balance).toFixed(2)}
        </Text>
      </View>
      {member.balance < 0 && (
        <TouchableOpacity style={styles.settleBtn}>
          <Text style={styles.settleBtnText}>Settle Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ExpenseItem = ({ expense }) => (
    <TouchableOpacity 
      style={styles.expenseItem}
      onPress={() => navigation.navigate('ExpenseDetails', { expenseId: expense.id })}
    >
      <View style={styles.expenseIcon}>
        <Icon name={getCategoryIcon(expense.category)} size={24} color={colors.primary} />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseTitle}>{expense.description}</Text>
        <Text style={styles.expenseMeta}>
          Paid by {expense.paidBy === 'me' ? 'You' : expense.paidByName} • {dayjs(expense.date).format('MMM D')}
        </Text>
      </View>
      <View style={styles.expenseAmountContainer}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
        <Text style={[
          styles.expenseShare,
          { color: expense.userShare >= 0 ? colors.success : colors.error }
        ]}>
          {expense.userShare >= 0 ? 'You lent' : 'You borrowed'} ${Math.abs(expense.userShare).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': 'silverware-fork-knife',
      'Travel': 'car',
      'Shopping': 'shopping',
      'Bills': 'file-document-outline',
      'Rent': 'home-outline',
      'Health': 'dumbbell',
      'Entertainment': 'movie-outline',
      'General': 'dots-horizontal',
    };
    return icons[category] || 'dots-horizontal';
  };

  const isLoading = groupLoading || expensesLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupDetails?.name || title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('GroupSettings', { groupId })}>
            <Icon name="cog-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.groupHero}>
          <View style={styles.imageContainer}>
            <Avatar source={groupDetails?.avatar} name={groupDetails?.name || title} size={100} radius={50} />
            <TouchableOpacity style={styles.editImageBtn}>
              <Icon name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.groupTitle}>{groupDetails?.name || title}</Text>
          <Text style={styles.totalSpent}>Total Spent: <Text style={styles.amountText}>${groupDetails?.totalSpent?.toFixed(2) || '0.00'}</Text></Text>
          
          <View style={styles.memberAvatars}>
            {groupDetails?.members?.slice(0, 4).map((member, index) => (
              <View key={member.id} style={[styles.avatarOverlap, { left: -10 * index, zIndex: 10 - index }]}>
                <Avatar source={member.avatar} name={member.name} size={32} radius={16} />
              </View>
            ))}
            {groupDetails?.members?.length > 4 && (
              <View style={[styles.avatarOverlap, styles.moreAvatars, { left: -40, zIndex: 0 }]}>
                <Text style={styles.moreAvatarsText}>+{groupDetails.members.length - 4}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Expenses' && styles.activeTab]} 
            onPress={() => setActiveTab('Expenses')}
          >
            <Text style={[styles.tabText, activeTab === 'Expenses' && styles.activeTabText]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Balances' && styles.activeTab]} 
            onPress={() => setActiveTab('Balances')}
          >
            <Text style={[styles.tabText, activeTab === 'Balances' && styles.activeTabText]}>Balances</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'Expenses' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ExpensesList', { groupId })}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {expenses.length > 0 ? (
                expenses.map(expense => <ExpenseItem key={expense.id} expense={expense} />)
              ) : (
                <EmptyState 
                  icon="receipt" 
                  title="No expenses yet" 
                  description="Start adding expenses to this group"
                />
              )}
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Outstanding Balances</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{groupDetails?.members?.length || 0} Members</Text>
                </View>
              </View>
              
              {groupDetails?.members?.map(member => (
                <BalanceItem key={member.id} member={member} />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddExpense', { groupId })}
      >
        <Icon name="plus" size={30} color={colors.white} />
      </TouchableOpacity>
      
      <LoadingOverlay visible={isLoading && !refreshing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  groupHero: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  totalSpent: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountText: {
    fontWeight: '700',
  },
  memberAvatars: {
    flexDirection: 'row',
    paddingLeft: 30,
    height: 32,
  },
  avatarOverlap: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  moreAvatars: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  settleBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  settleBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  expenseShare: {
    fontSize: 11,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default GroupDetailsScreen;
