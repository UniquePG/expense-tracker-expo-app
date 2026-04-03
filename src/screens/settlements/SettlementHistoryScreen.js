import React, { useEffect } from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSettlements } from '../../hooks/useSettlements';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import SettlementCard from '../../components/cards/SettlementCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';

const SettlementHistoryScreen = ({ route, navigation }) => {
  const { friendId, groupId } = route.params || {};
  const params = friendId ? { friendId } : groupId ? { groupId } : {};
  const { settlements, isLoading, fetchSettlements } = useSettlements(params);

  useEffect(() => {
    fetchSettlements(params);
  }, [friendId, groupId]);

  return (
    <ScreenWrapper>
      <Header title="Settlement History" showBack />
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
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchSettlements(params)} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="history"
              title="No History"
              description="No settlements found for this selection."
            />
          )
        }
      />
      <LoadingOverlay visible={isLoading && settlements.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default SettlementHistoryScreen;
