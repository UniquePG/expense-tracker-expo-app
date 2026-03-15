import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useSettlementsStore } from '@/store';
import { SettlementCard } from '../../components/cards/SettlementCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { TabBar } from '../../components/ui/TabBar';
import { useFriends } from '../../hooks/useFriends';
import { formatCurrency } from '../../utils/formatCurrency';

const TABS = [
  {key: 'pending', label: 'Pending'},
  {key: 'completed', label: 'Completed'},
];

export const SettlementsScreen = ({navigation, route}) => {
  const {friendId} = route.params || {};
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('pending');
  const {settlements, isLoading, fetchSettlements, createSettlement} = useSettlementsStore();
  const {balances, fetchBalances} = useFriends();

  useEffect(() => {
    loadData();
  }, [activeTab, friendId]);

  const loadData = async () => {
    await Promise.all([
      fetchSettlements(activeTab === 'pending' ? {status: 'pending'} : {status: 'completed'}),
      fetchBalances(),
    ]);
  };

  const handleSettle = async (settlement) => {
    Alert.alert(
      'Confirm Settlement',
      `Mark this ${formatCurrency(settlement.amount)} payment as received?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // API call to confirm settlement
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm settlement');
            }
          },
        },
      ]
    );
  };

  const renderSettlementItem = ({item}) => (
    <SettlementCard
      settlement={item}
      onPress={() => navigation.navigate('SettlementDetails', {id: item.id})}
      onSettle={() => handleSettle(item)}
      showActions={activeTab === 'pending'}
    />
  );

  const renderBalanceSummary = () => {
    if (!balances.length) return null;

    const totalOwed = balances.filter(b => b.amount < 0).reduce((sum, b) => sum + Math.abs(b.amount), 0);
    const totalOwe = balances.filter(b => b.amount > 0).reduce((sum, b) => sum + b.amount, 0);

    return (
      <View style={styles.balanceSummary}>
        <View style={[styles.balanceCard, {backgroundColor: theme.colors.expense + '10'}]}>
          <Text style={[styles.balanceLabel, {color: theme.colors.textSecondary}]}>
            You Owe
          </Text>
          <Text style={[styles.balanceAmount, {color: theme.colors.expense}]}>
            {formatCurrency(totalOwed)}
          </Text>
        </View>
        <View style={[styles.balanceCard, {backgroundColor: theme.colors.income + '10'}]}>
          <Text style={[styles.balanceLabel, {color: theme.colors.textSecondary}]}>
            You Are Owed
          </Text>
          <Text style={[styles.balanceAmount, {color: theme.colors.income}]}>
            {formatCurrency(totalOwe)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={activeTab === 'pending' ? 'clock-outline' : 'check-circle'}
      title={activeTab === 'pending' ? 'No pending settlements' : 'No completed settlements'}
      message={activeTab === 'pending' ? "You're all caught up!" : 'Your settlement history will appear here'}
    />
  );

  const filteredSettlements = friendId 
    ? settlements.filter(s => s.toUser?.id === friendId || s.fromUser?.id === friendId)
    : settlements;

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Settlements"
        onBack={() => navigation.goBack()}
        rightIcon="plus"
        onRightPress={() => navigation.navigate('SettleDebt')}
      />

      {renderBalanceSummary()}

      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        style={styles.tabBar}
      />

      {filteredSettlements.length === 0 && !isLoading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredSettlements}
          keyExtractor={(item) => item.id}
          renderItem={renderSettlementItem}
          contentContainerStyle={styles.listContent}
          onRefresh={loadData}
          refreshing={isLoading}
        />
      )}

      <LoadingOverlay visible={isLoading && settlements.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  balanceSummary: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});