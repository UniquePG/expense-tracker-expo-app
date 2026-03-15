import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FloatingActionButton } from '../../components/buttons/FloatingActionButton';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { SearchInput } from '../../components/inputs/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { TabBar } from '../../components/ui/TabBar';
import { useTransactions } from '../../hooks/useTransactions';
import { useTransactionStore } from '../../store/transactionStore';
import { formatDate } from '../../utils/dateFormatter';

const TABS = [
  {key: 'all', label: 'All'},
  {key: 'expense', label: 'Expenses'},
  {key: 'income', label: 'Income'},
];

export const TransactionListScreen = ({navigation}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {transactions, isLoading, loadMore, refresh, categories} = useTransactions({
    autoFetch: true,
  });
  const {setFilters} = useTransactionStore();

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilters({type: null});
    } else {
      setFilters({type: tab});
    }
    refresh();
  }, [setFilters, refresh]);

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.description?.toLowerCase().includes(query) ||
      t.category?.name?.toLowerCase().includes(query)
    );
  });

  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    transactions.forEach(transaction => {
      const date = formatDate(transaction.date, 'YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, items]) => ({
        title: formatDate(date, 'MMMM D, YYYY'),
        data: items,
      }));
  };

  const groupedData = groupTransactionsByDate(filteredTransactions);

  const renderSectionHeader = ({title}) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
        {title}
      </Text>
    </View>
  );

  const renderItem = ({item}) => (
    <TransactionCard
      transaction={item}
      onPress={() => navigation.navigate('TransactionDetails', {id: item.id})}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="receipt"
      title="No transactions found"
      message={searchQuery ? "Try adjusting your search" : "Add your first transaction to get started"}
      actionLabel="Add Transaction"
      onAction={() => navigation.navigate('AddExpense')}
    />
  );

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Transactions"
        rightIcon="filter-variant"
        onRightPress={() => {/* Open filter modal */}}
      />

      <View style={styles.container}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          style={styles.searchInput}
        />

        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {groupedData.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={groupedData}
            keyExtractor={(item) => item.title}
            renderItem={({item}) => (
              <View>
                {renderSectionHeader({title: item.title})}
                {item.data.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => navigation.navigate('TransactionDetails', {id: transaction.id})}
                  />
                ))}
              </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <FloatingActionButton
        onPress={() => navigation.navigate('AddExpense')}
        style={styles.fab}
      />

      <LoadingOverlay visible={isLoading && transactions.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});