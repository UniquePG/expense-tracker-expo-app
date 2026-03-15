import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {settlementsApi} from '../../api/settlementsApi';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {SettlementCard} from '../../components/cards/SettlementCard';
import {EmptyState} from '../../components/ui/EmptyState';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {groupBy} from '../../utils/helpers';
import {formatDate} from '../../utils/dateFormatter';

export const SettlementHistoryScreen = ({navigation}) => {
  const theme = useTheme();
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await settlementsApi.getSettlements({status: 'completed', limit: 100});
      setSettlements(response.data.settlements);
    } catch (error) {
      console.error('Failed to fetch settlement history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedSettlements = groupBy(settlements, s => formatDate(s.date, 'MMMM YYYY'));

  const renderMonthSection = (month, monthSettlements) => (
    <View key={month}>
      <Text style={[styles.monthHeader, {color: theme.colors.text}]}>
        {month}
      </Text>
      {monthSettlements.map(settlement => (
        <SettlementCard
          key={settlement.id}
          settlement={settlement}
          showActions={false}
        />
      ))}
    </View>
  );

  if (!isLoading && settlements.length === 0) {
    return (
      <ScreenWrapper safeArea={true}>
        <Header title="Settlement History" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="history"
          title="No history yet"
          message="Your completed settlements will appear here"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Settlement History" onBack={() => navigation.goBack()} />

      <FlatList
        data={Object.entries(groupedSettlements)}
        keyExtractor={([month]) => month}
        renderItem={({item: [month, monthSettlements]}) => renderMonthSection(month, monthSettlements)}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchHistory}
        refreshing={isLoading}
      />

      <LoadingOverlay visible={isLoading && settlements.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
});