import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { buildSettlementSuggestions, getMemberAvatar, getMemberName } from './groupUtils';

const chartWidth = Dimensions.get('window').width - 80;
const GROUP_TABS = [
  { key: 'EXPENSES', label: 'Expenses' },
  { key: 'BALANCES', label: 'Balances' },
  { key: 'ANALYTICS', label: 'Analytics' },
];

const toneMap = {
  positive: { text: colors.success, background: '#E8F8F4' },
  negative: { text: colors.error, background: '#FEEDEE' },
  neutral: { text: colors.textSecondary, background: '#EDF2F7' },
};

const getBalanceTone = (value) => {
  const amount = Number(value || 0);
  if (amount > 0) return { key: 'positive', label: 'You are owed' };
  if (amount < 0) return { key: 'negative', label: 'You owe' };
  return { key: 'neutral', label: 'Settled' };
};

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId, title } = route.params || {};
  const authUserId = useAuthStore((state) => state.user?.id);
  const [activeTab, setActiveTab] = useState('EXPENSES');
  const [refreshing, setRefreshing] = useState(false);

  const {
    groupDetails,
    groupExpenses,
    groupBalances,
    groupAnalytics,
    isLoading,
    isActionLoading,
    getGroupDetails,
    fetchGroupExpenses,
    fetchGroupBalances,
    fetchGroupAnalytics,
    settleGroup,
  } = useGroups();

  const group = groupDetails;
  const members = group?.members || [];
  const isAdmin = useMemo(() => {
    if (!authUserId) return Boolean(group?.isAdmin);
    const member = members.find((item) => item.userId === authUserId || item.id === authUserId);
    return Boolean(member?.isAdmin || group?.isAdmin);
  }, [authUserId, group?.isAdmin, members]);

  const myBalanceInfo = useMemo(() => {
    if (authUserId) {
      const fromBalances = groupBalances.find(
        (item) => item.userId === authUserId || item.id === authUserId
      );
      if (fromBalances) return fromBalances;
    }
    return { balance: Number(group?.myBalance ?? group?.balance ?? 0) };
  }, [authUserId, group?.balance, group?.myBalance, groupBalances]);

  const settlementSuggestions = useMemo(
    () => buildSettlementSuggestions(groupBalances || []),
    [groupBalances]
  );

  const runTabRequest = useCallback(
    async (tabKey) => {
      if (tabKey === 'EXPENSES') {
        await fetchGroupExpenses(groupId);
      }
      if (tabKey === 'BALANCES') {
        await fetchGroupBalances(groupId);
      }
      if (tabKey === 'ANALYTICS') {
        await fetchGroupAnalytics(groupId);
      }
    },
    [fetchGroupAnalytics, fetchGroupBalances, fetchGroupExpenses, groupId]
  );

  const loadInitialData = useCallback(async () => {
    await getGroupDetails(groupId);
    await runTabRequest('EXPENSES');
    await runTabRequest('BALANCES');
  }, [getGroupDetails, groupId, runTabRequest]);

  useFocusEffect(
    useCallback(() => {
      loadInitialData().catch(() => {
        Alert.alert('Error', 'Failed to load group details.');
      });
    }, [loadInitialData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getGroupDetails(groupId);
      await runTabRequest(activeTab);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to refresh group data.');
    } finally {
      setRefreshing(false);
    }
  };

  const onTabPress = async (tabKey) => {
    setActiveTab(tabKey);
    try {
      await runTabRequest(tabKey);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load tab data.');
    }
  };

  const handleSettleAll = () => {
    Alert.alert(
      'Settle All',
      'Mark all outstanding group splits as settled?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          onPress: async () => {
            try {
              await settleGroup(groupId);
              await runTabRequest('BALANCES', true);
              Alert.alert('Success', 'Group marked as settled.');
            } catch (error) {
              Alert.alert('Error', error?.message || 'Failed to settle group.');
            }
          },
        },
      ]
    );
  };

  const renderExpenseTab = () => {
    if (!groupExpenses.length) {
      return (
        <EmptyState
          icon="receipt-text-outline"
          title="No group expenses"
          message="Add the first expense and split it with members."
          actionTitle="Add Expense"
          onActionPress={() => navigation.navigate('AddExpense', { groupId })}
        />
      );
    }

    return (
      <View style={styles.listSection}>
        {groupExpenses.map((expense) => (
          <TouchableOpacity
            key={String(expense.id)}
            style={styles.expenseRow}
            onPress={() => navigation.navigate('ExpenseDetails', { expenseId: expense.id })}
            activeOpacity={0.88}
          >
            <View style={styles.expenseIcon}>
              <Icon name={expense.categoryIcon || 'receipt'} size={20} color={colors.primary} />
            </View>
            <View style={styles.expenseCenter}>
              <Text style={styles.expenseTitle} numberOfLines={1}>
                {expense.description}
              </Text>
              <Text style={styles.expenseMeta} numberOfLines={1}>
                Paid by {expense.paidByName || 'Unknown'}
              </Text>
            </View>
            <View style={styles.expenseAmountWrap}>
              <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
              <Text style={styles.expenseCategory}>{expense.categoryName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBalanceTab = () => {
    if (!groupBalances.length) {
      return (
        <EmptyState
          icon="scale-balance"
          title="No balances yet"
          message="Balances will appear once expenses are added."
        />
      );
    }

    return (
      <View>
        <View style={styles.listSection}>
          {groupBalances.map((item) => {
            const tone = getBalanceTone(item.balance);
            const toneStyle = toneMap[tone.key];
            return (
              <View key={String(item.memberId || item.id)} style={styles.balanceRow}>
                <Avatar source={item.avatar} name={item.name} size={38} />
                <View style={styles.balanceCenter}>
                  <Text style={styles.balanceName}>{item.name}</Text>
                  <Text style={styles.balanceMeta}>
                    Paid {formatCurrency(item.totalPaid)} | Owes {formatCurrency(item.totalOwes)}
                  </Text>
                </View>
                <View style={[styles.balanceChip, { backgroundColor: toneStyle.background }]}>
                  <Text style={[styles.balanceChipText, { color: toneStyle.text }]}>
                    {formatCurrency(Math.abs(item.balance))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.simplifiedCard}>
          <Text style={styles.simplifiedTitle}>Settle Up Suggestions</Text>
          {settlementSuggestions.length === 0 ? (
            <Text style={styles.simplifiedEmpty}>All members are settled.</Text>
          ) : (
            settlementSuggestions.map((line, index) => {
              const canPayNow = line.from?.userId === authUserId && Boolean(line.to?.userId);
              return (
                <View key={`${line.from?.id}-${line.to?.id}-${index}`} style={styles.suggestionRow}>
                  <Text style={styles.suggestionText}>
                    {line.from?.name} pays {line.to?.name} {formatCurrency(line.amount)}
                  </Text>
                  {canPayNow && (
                    <TouchableOpacity
                      style={styles.payNowButton}
                      onPress={() =>
                        navigation.navigate('SettleDebt', {
                          friendId: line.to.userId,
                          amount: String(line.amount),
                        })
                      }
                    >
                      <Text style={styles.payNowText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>

        {isAdmin && settlementSuggestions.length > 0 && (
          <TouchableOpacity style={styles.settleAllButton} onPress={handleSettleAll}>
            <Text style={styles.settleAllText}>Settle All</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAnalyticsTab = () => {
    const analytics = groupAnalytics || {
      categoryBreakdown: [],
      topPayers: [],
      totalSpend: 0,
    };

    const pieData = analytics.categoryBreakdown.map((item) => ({
      value: item.amount,
      color: item.color || '#4BA3C7',
      text: item.name.slice(0, 3).toUpperCase(),
    }));

    const barData = analytics.topPayers.map((item, index) => ({
      value: item.amount,
      label: item.name.slice(0, 6),
      frontColor: ['#00B4D8', '#1D4ED8', '#0F766E', '#F59E0B', '#8B5CF6'][index % 5],
    }));

    if (!pieData.length && !barData.length) {
      return (
        <EmptyState
          icon="chart-pie"
          title="No analytics yet"
          message="Add a few expenses to view category and payer insights."
        />
      );
    }

    return (
      <View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Category Spend</Text>
          {pieData.length > 0 ? (
            <PieChart
              donut
              data={pieData}
              radius={95}
              innerRadius={62}
              centerLabelComponent={() => (
                <View style={styles.pieCenter}>
                  <Text style={styles.pieCenterLabel}>Total</Text>
                  <Text style={styles.pieCenterValue}>{formatCurrency(analytics.totalSpend || 0)}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.analyticsEmpty}>No category data available.</Text>
          )}
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Top Payers</Text>
          {barData.length > 0 ? (
            <BarChart
              data={barData}
              width={chartWidth}
              height={220}
              barWidth={28}
              roundedTop
              spacing={24}
              noOfSections={4}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              showValuesAsTopLabel
              topLabelTextStyle={styles.topLabel}
              isAnimated
            />
          ) : (
            <Text style={styles.analyticsEmpty}>No payer insights available.</Text>
          )}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'EXPENSES') return renderExpenseTab();
    if (activeTab === 'BALANCES') return renderBalanceTab();
    return renderAnalyticsTab();
  };

  const myBalanceTone = getBalanceTone(myBalanceInfo.balance);
  const myToneStyle = toneMap[myBalanceTone.key];

  return (
    <ScreenWrapper backgroundColor="#F3F7FC">
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group?.name || title || 'Group'}
        </Text>
        {isAdmin ? (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('GroupSettings', { groupId })}
          >
            <Icon name="cog-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIconButton} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <LinearGradient
          colors={['#0EA5E9', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Avatar source={group?.image} name={group?.name} size={74} style={styles.heroAvatar} />
          <Text style={styles.heroTitle}>{group?.name || 'Group'}</Text>
          <Text style={styles.heroSubTitle}>
            {members.length} members | {formatCurrency(group?.totalSpent || 0)} spent
          </Text>

          <TouchableOpacity
            style={styles.membersStrip}
            onPress={() => navigation.navigate('GroupMembers', { groupId })}
          >
            <View style={styles.memberStack}>
              {members.slice(0, 5).map((member, index) => (
                <View
                  key={`${member.id}-${index}`}
                  style={[styles.heroMember, { marginLeft: index === 0 ? 0 : -8 }]}
                >
                  <Avatar source={getMemberAvatar(member)} name={getMemberName(member)} size={26} />
                </View>
              ))}
              {members.length > 5 && (
                <View style={[styles.heroMember, styles.heroMemberMore]}>
                  <Text style={styles.heroMemberMoreText}>+{members.length - 5}</Text>
                </View>
              )}
            </View>
            <Text style={styles.membersLinkText}>Manage Members</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.myBalanceCard, { backgroundColor: myToneStyle.background }]}>
          <Text style={[styles.myBalanceLabel, { color: myToneStyle.text }]}>{myBalanceTone.label}</Text>
          <Text style={[styles.myBalanceValue, { color: myToneStyle.text }]}>
            {formatCurrency(Math.abs(myBalanceInfo.balance || 0))}
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          {GROUP_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => onTabPress(tab.key)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContentContainer}>{renderTabContent()}</View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense', { groupId })}
        activeOpacity={0.9}
      >
        <Icon name="plus" size={26} color={colors.white} />
      </TouchableOpacity>

      <LoadingOverlay visible={isLoading || isActionLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F3F7FC',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6EFF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
  },
  heroAvatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  heroSubTitle: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  membersStrip: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMember: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    overflow: 'hidden',
    backgroundColor: '#BFDBFE',
  },
  heroMemberMore: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C4A6E',
    marginLeft: -8,
  },
  heroMemberMoreText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  membersLinkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  myBalanceCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myBalanceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  myBalanceValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#E8EFF6',
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.white,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  tabContentContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  listSection: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    paddingVertical: 4,
    overflow: 'hidden',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F8',
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCenter: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseAmountWrap: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  expenseCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F8',
  },
  balanceCenter: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  balanceMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  balanceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  balanceChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  simplifiedCard: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7EEF6',
  },
  simplifiedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  simplifiedEmpty: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#F4F8FC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginRight: 8,
  },
  payNowButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  payNowText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  settleAllButton: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  settleAllText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  analyticsCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    alignItems: 'center',
  },
  analyticsTitle: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  analyticsEmpty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  pieCenterValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  axisText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  topLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
});

export default GroupDetailsScreen;
