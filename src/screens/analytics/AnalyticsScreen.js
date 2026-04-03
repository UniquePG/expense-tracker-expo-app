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
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import Card from '../../components/ui/Card';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { formatCurrency } from '../../utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

const TAB_DATA = [
  { id: 'overview', label: 'Overview', icon: 'chart-line' },
  { id: 'categories', label: 'Categories', icon: 'folder-multiple' },
  { id: 'trends', label: 'Trends', icon: 'trending-up' },
  { id: 'friends', label: 'Friends', icon: 'people' },
];

const PERIOD_OPTIONS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
];

const AnalyticsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePeriod, setActivePeriod] = useState('month');

  const {
    isLoading,
    fetchAllAnalytics,
    getOverviewTabData,
    getCategoriesTabData,
    getTrendsTabData,
    getFriendsTabData,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics(activePeriod);
  }, [activePeriod]);

  const renderOverviewTab = () => {
    const data = getOverviewTabData();
    const savings = data.savings;
    const savingsColor = savings >= 0 ? colors.success : colors.error;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main comparison card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Income vs Expense</Text>
          <View style={styles.chartContainer}>
            {data.totalIncome > 0 || data.totalExpense > 0 ? (
              <BarChart
                data={data.barData}
                width={screenWidth - 100}
                height={200}
                barWidth={40}
                spacing={40}
                roundedTop
                roundedBottom
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                noOfSections={4}
                isAnimated
                showValuesAsTopLabel
                topLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="chart-box-outline" size={56} color={colors.border} />
                <Text style={styles.emptyStateText}>No data for this period</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Metrics cards */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="arrow-down-circle" size={24} color={colors.success} />
            </View>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.metricValue}>{formatCurrency(data.totalIncome)}</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="arrow-up-circle" size={24} color={colors.error} />
            </View>
            <Text style={styles.metricLabel}>Expense</Text>
            <Text style={styles.metricValue}>{formatCurrency(data.totalExpense)}</Text>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: savings >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)' }]}>
            <View style={[styles.metricIcon, { backgroundColor: savings >= 0 ? '#D1FAE5' : '#FEE2E2' }]}>
              <Icon name="piggy-bank" size={24} color={savingsColor} />
            </View>
            <Text style={styles.metricLabel}>Savings</Text>
            <Text style={[styles.metricValue, { color: savingsColor }]}>
              {formatCurrency(savings)}
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="finance" size={24} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Save Rate</Text>
            <Text style={styles.metricValue}>{data.savingsPercentage.toFixed(1)}%</Text>
          </Card>
        </View>

        <TouchableOpacity
          style={styles.detailsNavBtn}
          onPress={() => setActiveTab('categories')}
          activeOpacity={0.8}
        >
          <Text style={styles.detailsNavText}>Explore Category Breakdown</Text>
          <Icon name="arrow-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderCategoriesTab = () => {
    const data = getCategoriesTabData();

    // Gifted Chart pieData expects {value, color, text} usually.
    const pieDataMap = data.pieData.map(item => ({
      value: item.population,
      color: item.color,
      text: item.name.substring(0, 3), // short name for pie label
    }));

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Spending by Category</Text>
          <View style={styles.chartContainer}>
            {pieDataMap.length > 0 ? (
              <PieChart
                donut
                data={pieDataMap}
                radius={90}
                innerRadius={60}
                centerLabelComponent={() => {
                  return (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 12, color: colors.textSecondary}}>Total</Text>
                      <Text style={{fontSize: 16, fontWeight: 'bold'}}>{formatCurrency(data.total)}</Text>
                    </View>
                  );
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="chart-pie" size={56} color={colors.border} />
                <Text style={styles.emptyStateText}>No category data yet</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Category list */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
             <Text style={styles.cardTitle}>Category Details</Text>
             <TouchableOpacity onPress={() => navigation.navigate('CategoryBreakdownScreen')}>
                <Icon name="open-in-new" size={20} color={colors.primary} />
             </TouchableOpacity>
          </View>
          
          {data.listData.length > 0 ? (
            <View>
              {data.listData.map((category) => (
                <View key={category.id} style={styles.categoryItemWrapper}>
                  <View style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <View style={styles.categoryText}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryCount}>
                          {category.percentage.toFixed(1)}% of total
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryAmountBox}>
                      <Text style={styles.categoryValue}>
                        {formatCurrency(category.amount)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.miniProgressBarBg}>
                      <View style={[styles.miniProgressBarFill, { width: `${category.percentage}%`, backgroundColor: category.color }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyStateText}>No categories yet</Text>
          )}
        </Card>
      </ScrollView>
    );
  };

  const renderTrendsTab = () => {
    const data = getTrendsTabData();

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.card}>
           <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Cash Flow Trends</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TrendsScreen')}>
                 <Icon name="open-in-new" size={20} color={colors.primary} />
              </TouchableOpacity>
           </View>
           
          <View style={styles.chartContainer}>
            {data.giftedIncome?.length > 0 ? (
              <LineChart
                areaChart
                data={data.giftedIncome}
                data2={data.giftedExpense}
                width={screenWidth - 80}
                height={220}
                spacing={screenWidth / (data.giftedIncome.length + 1)}
                initialSpacing={10}
                color1="#22C55E"
                color2="#EF4444"
                textColor1="green"
                dataPointsHeight={6}
                dataPointsWidth={6}
                dataPointsColor1="#22C55E"
                dataPointsColor2="#EF4444"
                textShiftY={-2}
                textShiftX={-5}
                textFontSize={10}
                thickness1={2}
                thickness2={2}
                startFillColor1="#22C55E"
                startFillColor2="#EF4444"
                startOpacity1={0.3}
                startOpacity2={0.3}
                endOpacity1={0.0}
                endOpacity2={0.0}
                yAxisTextStyle={{color: colors.textSecondary, fontSize: 10}}
                xAxisLabelTextStyle={{color: colors.textSecondary, fontSize: 10}}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={colors.border}
                isAnimated
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="chart-bell-curve" size={56} color={colors.border} />
                <Text style={styles.emptyStateText}>No trend data available</Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Legend</Text>
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
      </ScrollView>
    );
  };

  const renderFriendsTab = () => {
    const data = getFriendsTabData();

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Friend Balances</Text>
          <View style={styles.friendStatsContainer}>
            <View style={styles.friendStat}>
              <View style={[styles.friendStatIcon, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="arrow-top-right" size={24} color={colors.error} />
              </View>
              <Text style={styles.friendStatLabel}>You Owe</Text>
              <Text style={[styles.friendStatValue, { color: colors.error }]}>
                {formatCurrency(data.totalYouOwe)}
              </Text>
            </View>

            <View style={styles.friendStat}>
              <View style={[styles.friendStatIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="arrow-bottom-left" size={24} color={colors.success} />
              </View>
              <Text style={styles.friendStatLabel}>You're Owed</Text>
              <Text style={[styles.friendStatValue, { color: colors.success }]}>
                {formatCurrency(data.totalOwedToYou)}
              </Text>
            </View>
          </View>
        </Card>

        {data.creditors.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Top Creditors (You Owe)</Text>
            {data.creditors.map((friend) => (
              <View key={friend.id} style={styles.friendItem}>
                <View style={styles.friendInfo}>
                  <View style={styles.friendAvatar}>
                    <Icon name="account" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                </View>
                <Text style={[styles.friendAmount, { color: colors.error }]}>
                  -{formatCurrency(friend.amount)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {data.debtors.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Top Debtors (Owe You)</Text>
            {data.debtors.map((friend) => (
              <View key={friend.id} style={styles.friendItem}>
                <View style={styles.friendInfo}>
                  <View style={styles.friendAvatar}>
                    <Icon name="account" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                </View>
                <Text style={[styles.friendAmount, { color: colors.success }]}>
                  +{formatCurrency(friend.amount)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {data.creditors.length === 0 && data.debtors.length === 0 && (
          <View style={styles.emptyStateFull}>
             <View style={styles.iconCircle}>
                <Icon name="handshake-outline" size={48} color={colors.primary} />
             </View>
             <Text style={styles.emptyStateTitle}>All Settled Up!</Text>
             <Text style={styles.emptyStateText}>No friend balances pending for this period.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'categories':
        return renderCategoriesTab();
      case 'trends':
        return renderTrendsTab();
      case 'friends':
        return renderFriendsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
           <Text style={styles.headerSubtitle}>Insights</Text>
           <Text style={styles.title}>Analytics</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="dots-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Period selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodScroll}
        contentContainerStyle={styles.periodContainer}
      >
        {PERIOD_OPTIONS.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodBtn,
              activePeriod === period.id && styles.periodBtnActive,
            ]}
            onPress={() => setActivePeriod(period.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodText,
                activePeriod === period.id && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {TAB_DATA.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentWrapper}>
        {renderTabContent()}
      </View>

      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  shareBtn: {
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6', // light gray
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

  // Tab navigation
  tabScroll: {
    maxHeight: 60,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContainer: {
    paddingHorizontal: 24,
    gap: 24,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  // Content
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Cards and content
  card: {
    marginBottom: 20,
    padding: 20,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyState: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: colors.white,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  // Details Nav Button
  detailsNavBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 8,
     backgroundColor: colors.primary + '15',
     paddingVertical: 16,
     borderRadius: 16,
     marginTop: 8,
     marginBottom: 16,
  },
  detailsNavText: {
     fontSize: 15,
     fontWeight: '700',
     color: colors.primary,
  },

  // Category list
  categoryItemWrapper: {
     marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  categoryCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  categoryAmountBox: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  miniProgressBarBg: {
     height: 6,
     backgroundColor: '#F3F4F6',
     borderRadius: 3,
     width: '100%',
     overflow: 'hidden',
  },
  miniProgressBarFill: {
     height: 6,
     borderRadius: 3,
  },

  // Legend
  legendContainer: {
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },

  // Friend balances
  friendStatsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  friendStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
  },
  friendStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  friendStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  friendAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  
  // Empty states Friends
  emptyStateFull: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingVertical: 60,
     paddingHorizontal: 20,
  },
  iconCircle: {
     width: 100,
     height: 100,
     borderRadius: 50,
     backgroundColor: colors.primary + '15',
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 20,
  },
  emptyStateTitle: {
     fontSize: 22,
     fontWeight: '800',
     color: colors.text,
     marginBottom: 8,
  },
});

export default AnalyticsScreen;
