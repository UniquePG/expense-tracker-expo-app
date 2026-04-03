import { create } from 'zustand';
import { analyticsApi } from '../api';

const CHART_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

export const useAnalyticsStore = create((set, get) => ({
  // Raw API responses
  incomeVsExpense: null,
  categorySpending: null,
  monthlyTrends: null,
  friendBalances: null,
  isLoading: false,
  error: null,

  // Fetch all analytics data for a given period
  fetchAllAnalytics: async (period = 'month', months = 6) => {
    set({ isLoading: true, error: null });
    try {
      const params = { period };
      
      // Call all analytics endpoints in parallel
      const [incomeVsExpenseRes, categorySpendingRes, monthlyTrendsRes, friendBalancesRes] = 
        await Promise.all([
          analyticsApi.getIncomeVsExpense(params),
          analyticsApi.getCategorySpending(params),
          analyticsApi.getMonthlyTrends(params),
          analyticsApi.getFriendBalances(params),
        ]);

      set({
        incomeVsExpense: incomeVsExpenseRes.data,
        categorySpending: categorySpendingRes.data,
        monthlyTrends: monthlyTrendsRes.data,
        friendBalances: friendBalancesRes.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Data selectors for each tab
  getOverviewTabData: () => {
    const state = get();
    // analytics.service.js -> getIncomeVsExpense returns { income, expense, savings, savingsRate }
    const res = state.incomeVsExpense || {};
    // Extract actual payload (usually res.data, depending on axios interceptors)
    
    // Fallback if data is wrapped in another object:
    const data = res.data || res;
    
    const income = data.income || 0;
    const expense = data.expense || 0;
    const savings = data.savings || 0;
    const savingsPercentage = data.savingsRate || 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      savings: savings,
      savingsPercentage: savingsPercentage,
      chartData: {
        labels: ['Income', 'Expense'],
        datasets: [
          {
            data: [income, expense],
          }
        ],
      },
      // for gifted charts format:
      barData: [
        { value: income, label: 'Income', frontColor: '#22C55E' },
        { value: expense, label: 'Expense', frontColor: '#EF4444' }
      ]
    };
  },

  getCategoriesTabData: () => {
    const state = get();
    // analytics.service.js -> getSpendingByCategory returns { totalSpend, breakdown }
    const res = state.categorySpending || {};
    const data = res.data || res;

    const breakdown = data.breakdown || [];
    const totalSpend = data.totalSpend || 0;
    
    // Transform for pie chart
    const pieData = breakdown.map((item, index) => {
      const cat = item.category || {};
      return {
        name: cat.name || `Category ${index + 1}`,
        population: item.totalAmount || 0,
        color: cat.color || CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: '#6B7280',
        legendFontSize: 12,
      };
    });

    // Transform for list display
    const listData = breakdown.map((item, index) => {
      const cat = item.category || {};
      return {
        id: item.categoryId || index,
        name: cat.name || `Category ${index + 1}`,
        amount: item.totalAmount || 0,
        count: item.transactionCount || 0,
        percentage: item.percentage || 0,
        color: cat.color || CHART_COLORS[index % CHART_COLORS.length],
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      total: totalSpend,
      pieData,
      listData,
    };
  },

  getTrendsTabData: () => {
    const state = get();
    // analytics.service.js -> getMonthlyTrends returns array [{month, income, expense, savings}]
    let data = state.monthlyTrends || [];
    if (data.data) data = data.data; // unwrap if needed
    if (!Array.isArray(data)) data = [];
    
    // Format for gifted-charts LineChart
    const lineDataIncome = data.map(m => {
       const [y, mm] = (m.month || '').split('-');
       const date = new Date(y, parseInt(mm)-1, 1);
       return { value: m.income || 0, label: date.toLocaleString('default', { month: 'short' }) };
    });

    const lineDataExpense = data.map(m => {
      const [y, mm] = (m.month || '').split('-');
      const date = new Date(y, parseInt(mm)-1, 1);
      return { value: m.expense || 0, label: date.toLocaleString('default', { month: 'short' }) };
    });

    const lineDataSavings = data.map(m => {
      const [y, mm] = (m.month || '').split('-');
      const date = new Date(y, parseInt(mm)-1, 1);
      return { value: m.savings || 0, label: date.toLocaleString('default', { month: 'short' }) };
    });

    return {
      labels: data.map(m => {
         const [y, mm] = (m.month || '').split('-');
         const date = new Date(y, parseInt(mm)-1, 1);
         return date.toLocaleString('default', { month: 'short' });
      }),
      rawData: data,
      // React Native Chart Kit format
      datasets: [
        {
          data: data.map(m => m.income || 0),
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        },
        {
          data: data.map(m => m.expense || 0),
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        },
        {
          data: data.map(m => m.savings || 0),
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        },
      ],
      legend: ['Income', 'Expense', 'Savings'],
      // Gifted Charts format
      giftedIncome: lineDataIncome,
      giftedExpense: lineDataExpense,
      giftedSavings: lineDataSavings
    };
  },

  getFriendsTabData: () => {
    const state = get();
    // analytics.service.js -> getFriendBalances returns array [{friend, lent, borrowed, netBalance}]
    let data = state.friendBalances || [];
    if (data.data) data = data.data; // unwrap if needed
    if (!Array.isArray(data)) data = [];
    
    // debtor = owes us (netBalance > 0)
    const debtors = data
      .filter(b => b.netBalance > 0)
      .map((b, index) => ({
         id: b.friend?.id || index,
         name: `${b.friend?.firstName || ''} ${b.friend?.lastName || ''}`.trim() || 'Unknown',
         amount: b.netBalance,
         avatar: b.friend?.avatar,
      }))
      .sort((a,b) => b.amount - a.amount);

    // creditor = we owe them (netBalance < 0)
    const creditors = data
      .filter(b => b.netBalance < 0)
      .map((b, index) => ({
         id: b.friend?.id || index,
         name: `${b.friend?.firstName || ''} ${b.friend?.lastName || ''}`.trim() || 'Unknown',
         amount: Math.abs(b.netBalance),
         avatar: b.friend?.avatar,
      }))
      .sort((a,b) => b.amount - a.amount);

    return {
       totalYouOwe: creditors.reduce((sum, c) => sum + c.amount, 0),
       totalOwedToYou: debtors.reduce((sum, d) => sum + d.amount, 0),
       debtors,
       creditors,
    };
  },

  // Fetch individual analytics data (for specific screens)
  fetchCategorySpending: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsApi.getCategorySpending(params);
      set({ categorySpending: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchIncomeVsExpense: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsApi.getIncomeVsExpense(params);
      set({ incomeVsExpense: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMonthlyTrends: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsApi.getMonthlyTrends(params);
      set({ monthlyTrends: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchFriendBalances: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsApi.getFriendBalances(params);
      set({ friendBalances: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Setters
  setCategorySpending: (categorySpending) => set({ categorySpending }),
  setIncomeVsExpense: (incomeVsExpense) => set({ incomeVsExpense }),
  setMonthlyTrends: (monthlyTrends) => set({ monthlyTrends }),
  setFriendBalances: (friendBalances) => set({ friendBalances }),
}));

export default useAnalyticsStore;
