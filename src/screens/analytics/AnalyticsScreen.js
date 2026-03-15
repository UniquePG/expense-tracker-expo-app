import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {Text, useTheme, SegmentedButtons} from 'react-native-paper';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';
import {useAnalyticsStore} from '../../store/analyticsStore';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {EmptyState} from '../../components/ui/EmptyState';
import {formatCurrency} from '../../utils/formatCurrency';
import {getStartOfMonth, getEndOfMonth, subtractDays} from '../../utils/dateFormatter';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = ({navigation}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const {
    spendingByCategory,
    incomeVsExpense,
    monthlyTrends,
    isLoading,
    fetchSpendingByCategory,
    fetchIncomeVsExpense,
    fetchMonthlyTrends,
  } = useAnalyticsStore();

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const endDate = new Date().toISOString();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = subtractDays(new Date(), 7);
        break;
      case 'month':
        startDate = getStartOfMonth();
        break;
      case 'year':
        startDate = subtractDays(new Date(), 365);
        break;
      default:
        startDate = getStartOfMonth();
    }

    await Promise.all([
      fetchSpendingByCategory(startDate, endDate),
      fetchIncomeVsExpense(startDate, endDate),
      fetchMonthlyTrends(6),
    ]);
  };

  const renderTimeRangeSelector = () => (
    <SegmentedButtons
      value={timeRange}
      onValueChange={setTimeRange}
      buttons={[
        {value: 'week', label: 'Week'},
        {value: 'month', label: 'Month'},
        {value: 'year', label: 'Year'},
      ]}
      style={styles.segmentedButtons}
    />
  );

  const renderSummaryCards = () => {
    if (!incomeVsExpense) return null;

    const totalIncome = incomeVsExpense.income || 0;
    const totalExpense = incomeVsExpense.expense || 0;
    const netSavings = totalIncome - totalExpense;

    return (
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
            Total Income
          </Text>
          <Text style={[styles.summaryAmount, {color: theme.colors.income}]}>
            {formatCurrency(totalIncome)}
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
            Total Expense
          </Text>
          <Text style={[styles.summaryAmount, {color: theme.colors.expense}]}>
            {formatCurrency(totalExpense)}
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
            Net Savings
          </Text>
          <Text style={[
            styles.summaryAmount,
            {color: netSavings >= 0 ? theme.colors.income : theme.colors.expense}
          ]}>
            {formatCurrency(netSavings)}
          </Text>
        </Card>
      </View>
    );
  };

  const renderIncomeVsExpenseChart = () => {
    if (!incomeVsExpense?.dailyData?.length) return null;

    const data = {
      labels: incomeVsExpense.dailyData.map(d => d.date.slice(5)), // MM-DD
      datasets: [
        {
          data: incomeVsExpense.dailyData.map(d => d.income),
          color: () => theme.colors.income,
        },
        {
          data: incomeVsExpense.dailyData.map(d => d.expense),
          color: () => theme.colors.expense,
        },
      ],
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, {color: theme.colors.text}]}>
          Income vs Expense
        </Text>
        <BarChart
          data={data}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => theme.colors.textSecondary,
            barPercentage: 0.7,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </Card>
    );
  };

  const renderCategoryChart = () => {
    if (!spendingByCategory?.length) {
      return (
        <EmptyState
          icon="chart-pie"
          title="No spending data"
          message="You haven't recorded any expenses in this period"
        />
      );
    }

    const data = spendingByCategory.map(cat => ({
      name: cat.name,
      amount: cat.amount,
      color: cat.color,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, {color: theme.colors.text}]}>
          Spending by Category
        </Text>
        <PieChart
          data={data}
          width={screenWidth - 64}
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
      </Card>
    );
  };

  const renderTrendsChart = () => {
    if (!monthlyTrends?.length) return null;

    const data = {
      labels: monthlyTrends.map(t => t.month),
      datasets: [
        {
          data: monthlyTrends.map(t => t.expense),
          color: () => theme.colors.expense,
          strokeWidth: 2,
        },
        {
          data: monthlyTrends.map(t => t.income),
          color: () => theme.colors.income,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, {color: theme.colors.text}]}>
          6-Month Trends
        </Text>
        <LineChart
          data={data}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => theme.colors.textSecondary,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
          }}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Analytics" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderTimeRangeSelector()}
        {renderSummaryCards()}
        {renderIncomeVsExpenseChart()}
        {renderCategoryChart()}
        {renderTrendsChart()}
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
});