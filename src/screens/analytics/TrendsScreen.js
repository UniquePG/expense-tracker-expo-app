import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {Text, useTheme, SegmentedButtons} from 'react-native-paper';
import {LineChart} from 'react-native-chart-kit';
import {useAnalyticsStore} from '../../store/analyticsStore';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {formatCurrency} from '../../utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

export const TrendsScreen = ({navigation}) => {
  const theme = useTheme();
  const [months, setMonths] = useState(6);
  const {monthlyTrends, isLoading, fetchMonthlyTrends} = useAnalyticsStore();

  useEffect(() => {
    fetchMonthlyTrends(months);
  }, [months]);

  const chartData = {
    labels: monthlyTrends?.map(t => t.month) || [],
    datasets: [
      {
        data: monthlyTrends?.map(t => t.expense) || [],
        color: () => theme.colors.expense,
        strokeWidth: 2,
      },
      {
        data: monthlyTrends?.map(t => t.income) || [],
        color: () => theme.colors.income,
        strokeWidth: 2,
      },
    ],
  };

  const renderStats = () => {
    if (!monthlyTrends?.length) return null;

    const totalIncome = monthlyTrends.reduce((sum, t) => sum + t.income, 0);
    const totalExpense = monthlyTrends.reduce((sum, t) => sum + t.expense, 0);
    const avgIncome = totalIncome / monthlyTrends.length;
    const avgExpense = totalExpense / monthlyTrends.length;

    return (
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Avg. Income
          </Text>
          <Text style={[styles.statValue, {color: theme.colors.income}]}>
            {formatCurrency(avgIncome)}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Avg. Expense
          </Text>
          <Text style={[styles.statValue, {color: theme.colors.expense}]}>
            {formatCurrency(avgExpense)}
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Trends" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SegmentedButtons
          value={months.toString()}
          onValueChange={value => setMonths(parseInt(value))}
          buttons={[
            {value: '3', label: '3M'},
            {value: '6', label: '6M'},
            {value: '12', label: '1Y'},
          ]}
          style={styles.segmentedButtons}
        />

        {renderStats()}

        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, {color: theme.colors.text}]}>
            Income vs Expense Trend
          </Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={300}
            chartConfig={{
              backgroundColor: theme.colors.card,
              backgroundGradientFrom: theme.colors.card,
              backgroundGradientTo: theme.colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => theme.colors.textSecondary,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={styles.chart}
            yAxisLabel="$"
            yAxisSuffix=""
          />
        </Card>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: theme.colors.expense}]} />
            <Text style={{color: theme.colors.text}}>Expense</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: theme.colors.income}]} />
            <Text style={{color: theme.colors.text}}>Income</Text>
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartCard: {
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
});