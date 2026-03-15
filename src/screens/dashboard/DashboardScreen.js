import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Button, Text, useTheme } from 'react-native-paper';
import { FloatingActionButton } from '../../components/buttons/FloatingActionButton';
import { BalanceCard } from '../../components/cards/BalanceCard';
import { FriendCard } from '../../components/cards/FriendCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { useFriendsStore } from '../../store/friendsStore';

const screenWidth = Dimensions.get('window').width;

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const {user} = useAuthStore();
  console.log('user :', user);
  const {isOffline} = useNetworkStatus();
  // console.log('isOffline :', isOffline);
  
  const {
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
  } = useAnalyticsStore();
  
  console.log('dashboardData :', dashboardData);
  const {
    balances,
    fetchBalances,
  } = useFriendsStore();
  console.log('balances :', balances);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchBalances(),
    ]);
  }, []);

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={[styles.actionButton, {backgroundColor: theme.colors.primaryLight}]}
        onPress={() => navigation.navigate('AddExpense')}>
        <Icon name="cash-plus" size={24} color={theme.colors.primary} />
        <Text style={[styles.actionText, {color: theme.colors.text}]}>Add Expense</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, {backgroundColor: theme.colors.secondary + '20'}]}
        onPress={() => navigation.navigate('AddIncome')}>
        <Icon name="cash-minus" size={24} color={theme.colors.secondary} />
        <Text style={[styles.actionText, {color: theme.colors.text}]}>Add Income</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, {backgroundColor: theme.colors.info + '20'}]}
        onPress={() => navigation.navigate('CreateGroup')}>
        <Icon name="account-group" size={24} color={theme.colors.info} />
        <Text style={[styles.actionText, {color: theme.colors.text}]}>New Group</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBalanceCards = () => {
    if (!dashboardData) return null;
    
    return (
      <View style={styles.balanceCards}>
        <BalanceCard
          title="Total Balance"
          amount={dashboardData.totalBalance}
          currency={dashboardData.currency}
          style={styles.balanceCard}
        />
        <BalanceCard
          title="You Owe"
          amount={dashboardData.totalBorrowed}
          currency={dashboardData.currency}
          style={styles.balanceCard}
        />
        <BalanceCard
          title="You Are Owed"
          amount={dashboardData.totalLent}
          currency={dashboardData.currency}
          style={styles.balanceCard}
        />
      </View>
    );
  };

  const renderMonthlyOverview = () => {
    if (!dashboardData?.monthlyData) return null;

    const data = {
      labels: dashboardData.monthlyData.map(d => d.month),
      datasets: [
        {
          data: dashboardData.monthlyData.map(d => d.expense),
          color: () => theme.colors.expense,
          strokeWidth: 2,
        },
        {
          data: dashboardData.monthlyData.map(d => d.income),
          color: () => theme.colors.income,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Monthly Overview
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Trends')}
            compact>
            See All
          </Button>
        </View>
        
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => theme.colors.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!dashboardData?.categoryBreakdown?.length) return null;

    const data = dashboardData.categoryBreakdown.map(cat => ({
      name: cat.name,
      amount: cat.amount,
      color: cat.color,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Spending by Category
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('CategoryBreakdown')}
            compact>
            See All
          </Button>
        </View>
        
        <PieChart
          data={data}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      </View>
    );
  };

  const renderRecentTransactions = () => {
    if (!dashboardData?.recentTransactions?.length) {
      return (
        <EmptyState
          icon="receipt"
          title="No transactions yet"
          message="Add your first expense or income to see it here"
          actionLabel="Add Transaction"
          onAction={() => navigation.navigate('AddExpense')}
        />
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Recent Transactions
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('TransactionList')}
            compact>
            See All
          </Button>
        </View>
        
        {dashboardData.recentTransactions.map(transaction => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onPress={() => navigation.navigate('TransactionDetails', {id: transaction.id})}
          />
        ))}
      </View>
    );
  };

  const renderOutstandingBalances = () => {
    const outstandingBalances = balances.filter(b => b.amount !== 0);
    
    if (!outstandingBalances.length) {
      return (
        <EmptyState
          icon="check-circle"
          title="All settled up!"
          message="You have no outstanding balances with friends"
        />
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Outstanding Balances
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Settlements')}
            compact>
            See All
          </Button>
        </View>
        
        {outstandingBalances.slice(0, 3).map(balance => (
          <FriendCard
            key={balance.friendId}
            friend={balance.friend}
            balance={balance}
            onPress={() => navigation.navigate('FriendProfile', {id: balance.friendId})}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title={`Hello, ${user?.firstName || 'User'}`}
        subtitle={isOffline ? 'Offline Mode' : 'Welcome back'}
        rightIcon="bell"
        onRightPress={() => navigation.navigate('Notifications')}
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        contentContainerStyle={styles.scrollContent}>
        
        {renderQuickActions()}
        {renderBalanceCards()}
        {renderMonthlyOverview()}
        {renderCategoryBreakdown()}
        {renderRecentTransactions()}
        {renderOutstandingBalances()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('CreateExpense')}
        style={styles.fab}
      />

      <LoadingOverlay visible={isLoading && !dashboardData} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  balanceCards: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chart: {
    marginHorizontal: 16,
    borderRadius: 16,
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});