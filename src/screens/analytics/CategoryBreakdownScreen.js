import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { getEndOfMonth, getStartOfMonth } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';

export const CategoryBreakdownScreen = ({navigation}) => {
  const theme = useTheme();
  const {spendingByCategory, isLoading, fetchSpendingByCategory} = useAnalyticsStore();

  useEffect(() => {
    const startDate = getStartOfMonth();
    const endDate = getEndOfMonth();
    fetchSpendingByCategory(startDate, endDate);
  }, []);

  const totalSpending = spendingByCategory?.reduce((sum, cat) => sum + cat.amount, 0) || 0;

  const renderCategoryItem = ({item, index}) => {
    const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
    
    return (
      <Card style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.iconContainer, {backgroundColor: item.color + '20'}]}>
              <Icon name={item.icon || 'help-circle'} size={24} color={item.color} />
            </View>
            <View>
              <Text style={[styles.categoryName, {color: theme.colors.text}]}>
                {item.name}
              </Text>
              <Text style={[styles.transactionCount, {color: theme.colors.textSecondary}]}>
                {item.transactionCount} transactions
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, {color: theme.colors.text}]}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={[styles.percentage, {color: theme.colors.textSecondary}]}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        <ProgressBar
          progress={percentage / 100}
          color={item.color}
          style={styles.progressBar}
        />
      </Card>
    );
  };

  if (!isLoading && !spendingByCategory?.length) {
    return (
      <ScreenWrapper safeArea={true}>
        <Header title="Category Breakdown" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="chart-pie"
          title="No data available"
          message="You haven't recorded any expenses this month"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Category Breakdown" onBack={() => navigation.goBack()} />
      
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, {color: theme.colors.textSecondary}]}>
          Total Spending
        </Text>
        <Text style={[styles.totalAmount, {color: theme.colors.expense}]}>
          {formatCurrency(totalSpending)}
        </Text>
      </View>

      <FlatList
        data={spendingByCategory}
        keyExtractor={item => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContent}
      />

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  totalContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  categoryCard: {
    marginBottom: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCount: {
    fontSize: 12,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});