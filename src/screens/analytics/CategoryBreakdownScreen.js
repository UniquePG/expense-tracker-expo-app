import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { formatCurrency } from '../../utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

const CategoryBreakdownScreen = ({ navigation }) => {
  const [period, setPeriod] = useState('month');
  const { isLoading, fetchAllAnalytics, getCategoriesTabData } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics(period);
  }, [period]);

  const periodOptions = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'Last 3 Months' },
    { id: 'year', label: 'This Year' },
  ];

  const data = getCategoriesTabData();

  const pieDataMap = data.pieData.map((item) => ({
    value: item.population,
    color: item.color,
    text: item.name.substring(0, 3)
  }));

  return (
    <ScreenWrapper style={{ backgroundColor: '#FAFAFA' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Category Breakdown</Text>
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
          <Text style={styles.chartTitle}>Spending by Category</Text>
          {pieDataMap.length > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                donut
                data={pieDataMap}
                radius={110}
                innerRadius={75}
                centerLabelComponent={() => {
                  return (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 14, color: colors.textSecondary}}>Total Spend</Text>
                      <Text style={{fontSize: 20, fontWeight: '800', color: colors.text}}>{formatCurrency(data.total)}</Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Icon name="chart-pie" size={56} color={colors.border} />
              <Text style={styles.emptyText}>No category data for this period</Text>
            </View>
          )}
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>CATEGORIES OVERVIEW</Text>
          {data.listData.length > 0 ? (
            <View>
              {data.listData.map((category, index) => (
                <View key={category.id} style={styles.categoryItemWrapper}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.colorIconBox,
                          { backgroundColor: category.color + '20' }, // 20% opacity
                        ]}
                      >
                         <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryCount}>
                          {category.percentage.toFixed(1)}% of total
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(category.amount)}
                      </Text>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-multiple-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No expenditures categorized yet.</Text>
            </View>
          )}
        </Card>
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
    marginBottom: 20,
    textAlign: 'center'
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Details card
  detailsCard: {
    padding: 24,
    marginBottom: 20,
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
  detailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 24,
  },
  categoryItemWrapper: {
    marginBottom: 20,
  },

  // Category row
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  colorIconBox: {
     width: 44,
     height: 44,
     borderRadius: 16,
     justifyContent: 'center',
     alignItems: 'center',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  categoryCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },

  // Progress bar
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  // Empty state
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500'
  },
});

export default CategoryBreakdownScreen;
