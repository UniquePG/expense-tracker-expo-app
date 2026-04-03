import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSettlements } from '../../hooks/useSettlements';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import SettlementCard from '../../components/cards/SettlementCard';
import EmptyState from '../../components/ui/EmptyState';
import FloatingActionButton from '../../components/buttons/FloatingActionButton';
import { colors } from '../../constants/colors';
import TabBar from '../../components/ui/TabBar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const SettlementsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('received');
  const { settlements, isLoading, fetchSettlements } = useSettlements({ type: activeTab });

  useEffect(() => {
    fetchSettlements({ type: activeTab });
  }, [activeTab]);

  const tabs = [
    { id: 'received', label: 'Received' },
    { id: 'sent', label: 'Sent' },
  ];

  return (
    <ScreenWrapper>
      <Header title="Settlements" showBack />
      <TabBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <FlatList
        data={settlements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SettlementCard 
            settlement={item} 
            onPress={() => {}} 
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchSettlements({ type: activeTab })} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="handshake"
              title="No Settlements Found"
              description={activeTab === 'received' 
                ? "You haven't received any payments yet." 
                : "You haven't made any payments yet."}
              actionTitle="Settle Up"
              onActionPress={() => navigation.navigate('SettleDebt')}
            />
          )
        }
      />
      <FloatingActionButton 
        icon="handshake" 
        onPress={() => navigation.navigate('SettleDebt')} 
      />
      <LoadingOverlay visible={isLoading && settlements.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100,
  },
});

export default SettlementsScreen;
