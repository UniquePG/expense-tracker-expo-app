import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import TransactionCard from '../../components/cards/TransactionCard';
import SearchInput from '../../components/inputs/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import FloatingActionButton from '../../components/buttons/FloatingActionButton';
import { colors } from '../../constants/colors';
import TabBar from '../../components/ui/TabBar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const TransactionListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { transactions, isLoading, fetchTransactions } = useTransactions({ 
    type: activeTab === 'all' ? null : activeTab 
  });

  useEffect(() => {
    fetchTransactions({ type: activeTab === 'all' ? null : activeTab });
  }, [activeTab]);

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
  t.category?.name.toLowerCase().includes(search.toLowerCase())
);
console.log('filteredTransactions :', filteredTransactions);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'expense', label: 'Expenses' },
    { value: 'income', label: 'Income' },
  ];

  return (
    <ScreenWrapper>
      <Header title="Transactions" showBack />
      <TabBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />
      <View style={styles.searchContainer}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
        />
      </View>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item, i) => item.id || i}
        renderItem={({ item }) => (
          <TransactionCard 
            transaction={item} 
            onPress={() => navigation.navigate('TransactionDetails', { transactionvalue: item.id })} 
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchTransactions({ type: activeTab === 'all' ? null : activeTab })} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="swap-horizontal"
              title="No Transactions Found"
              description={search ? "Try a different search term." : "You haven't recorded any transactions yet."}
              actionTitle={search ? null : "Add Transaction"}
              onActionPress={() => navigation.navigate('AddExpense')}
            />
          )
        }
      />
      <FloatingActionButton 
        icon="plus" 
        onPress={() => navigation.navigate('AddExpense')} 
      />
      <LoadingOverlay visible={isLoading && transactions.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
});

export default TransactionListScreen;
