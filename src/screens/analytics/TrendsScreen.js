import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Card from '../../components/ui/Card';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { formatCurrency } from '../../utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

const TrendsScreen = ({ navigation }) => {
  const [period, setPeriod] = useState('month');
  const { isLoading, fetchAllAnalytics, getTrendsTabData } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics(period);
  }, [period]);

  const periodOptions = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'Last 3 Months' },
    { id: 'year', label: 'This Year' },
  ];

  const trendData = getTrendsTabData();

  // Helper calculation for averages safely
  const calculateAverage = (dataArr) => {
     if (!dataArr || dataArr.length === 0) return 0;
     const sum = dataArr.reduce((acc, curr) => acc + curr.value, 0);
     return sum / Math.max(dataArr.length, 1);
  };

  const avgIncome = calculateAverage(trendData.giftedIncome);
  const avgExpense = calculateAverage(trendData.giftedExpense);
  const avgSavings = calculateAverage(trendData.giftedSavings);

  return (
    <ScreenWrapper style={{ backgroundColor: '#FAFAFA' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Spending Trends</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Period selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodScroll}
        contentContainerStyle={styles.periodContainer}
      >
        {periodOptions.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.periodBtn,
              period === opt.id && styles.periodBtnActive,
            ]}
            onPress={() => setPeriod(opt.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodText,
                period === opt.id && styles.periodTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Chart Card */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income vs Expenses vs Savings</Text>
          {trendData.giftedIncome?.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                areaChart
                data={trendData.giftedIncome}
                data2={trendData.giftedExpense}
                data3={trendData.giftedSavings}
                width={screenWidth - 80}
                height={240}
                spacing={screenWidth / (trendData.giftedIncome.length + 1)}
                initialSpacing={10}
                color1="#22C55E"
                color2="#EF4444"
                color3="#3B82F6"
                dataPointsHeight={6}
                dataPointsWidth={6}
                dataPointsColor1="#22C55E"
                dataPointsColor2="#EF4444"
                dataPointsColor3="#3B82F6"
                textShiftY={-2}
                textShiftX={-5}
                textFontSize={10}
                thickness1={2}
                thickness2={2}
                thickness3={2}
                startFillColor1="#22C55E"
                startFillColor2="#EF4444"
                startFillColor3="#3B82F6"
                startOpacity1={0.3}
                startOpacity2={0.3}
                startOpacity3={0.3}
                endOpacity1={0.0}
                endOpacity2={0.0}
                endOpacity3={0.0}
                yAxisTextStyle={{color: colors.textSecondary, fontSize: 10}}
                xAxisLabelTextStyle={{color: colors.textSecondary, fontSize: 10}}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={colors.border}
                isAnimated
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Icon name="chart-bell-curve" size={56} color={colors.border} />
              <Text style={styles.emptyText}>No trend data available for this period</Text>
            </View>
          )}
        </Card>

        {/* Legend */}
        <Card style={styles.legendCard}>
          <Text style={styles.legendTitle}>LEGEND</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Expense</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Savings</Text>
            </View>
          </View>
        </Card>

        {/* Summary Stats */}
        {trendData.giftedIncome?.length > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Period Averages</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name="arrow-top-right" size={24} color={colors.success} />
                </View>
                <Text style={styles.statLabel}>Monthly Income</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {formatCurrency(avgIncome)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="arrow-bottom-right" size={24} color={colors.error} />
                </View>
                <Text style={styles.statLabel}>Monthly Expense</Text>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {formatCurrency(avgExpense)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Icon name="piggy-bank" size={24} color={colors.primary} />
                </View>
                <Text style={styles.statLabel}>Monthly Savings</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(avgSavings)}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  // Period selector
  periodScroll: {
    maxHeight: 50,
  },
  periodContainer: {
    paddingHorizontal: 24,
    gap: 12,
    alignItems: 'center',
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  periodBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.white,
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Chart card
  chartCard: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center'
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyChart: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Legend
  legendCard: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },

  // Stats
  statsCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});

export default TrendsScreen;
