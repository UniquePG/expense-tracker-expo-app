import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Header from "../../components/ui/Header";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import ScreenWrapper from "../../components/ui/ScreenWrapper";
import { colors } from "../../constants/colors";
import { useAccounts } from "../../hooks/useAccounts";
import { formatDate } from "../../utils/dateFormatter";
import { formatCurrency } from "../../utils/formatCurrency";
;

const AccountDetailScreen = ({ route, navigation }) => {
  const { account, accountId } = route.params || {};
  const { fetchAccountById, isLoading } = useAccounts();
  
  const [accountData, setAccountData] = useState(account);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("ALL");

  useFocusEffect(
    useCallback(() => {
      loadAccountDetails();
    }, [])
  );

  const loadAccountDetails = async () => {
    try {
      if (accountId) {
        const data = await fetchAccountById(accountId);
        setAccountData(data?.account || account);
        setTransactions(data?.transactions || []);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load account details");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccountDetails();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    // Load more transactions here
    // setPage((prev) => prev + 1);
  };

  const getTransactionIcon = (type) => {
    const iconMap = {
      INCOME: "arrow-bottom-left",
      EXPENSE: "arrow-top-right",
      TRANSFER: "arrow-left-right",
      SETTLEMENT: "check-circle",
    };
    return iconMap[type] || "swap";
  };

  const getTransactionColor = (type) => {
    const colorMap = {
      INCOME: colors.success,
      EXPENSE: colors.error,
      TRANSFER: colors.primary,
      SETTLEMENT: "#8B5CF6",
    };
    return colorMap[type] || colors.primary;
  };

  const getTransactionAmount = (transaction) => {
    if (transaction.type === "INCOME") {
      return `+${formatCurrency(transaction.amount, accountData?.currency)}`;
    }
    return `-${formatCurrency(transaction.amount, accountData?.currency)}`;
  };

  const renderTransactionItem = ({ item: transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() =>
        navigation.navigate("TransactionDetails", {
          transactionId: transaction.id,
        })
      }
    >
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: `${getTransactionColor(transaction.type)}20` },
        ]}
      >
        <Icon
          name={getTransactionIcon(transaction.type)}
          size={20}
          color={getTransactionColor(transaction.type)}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {transaction.description || transaction.type}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amount,
            {
              color:
                transaction.type === "INCOME"
                  ? colors.success
                  : colors.error,
            },
          ]}
        >
          {getTransactionAmount(transaction)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!accountData) {
    return (
      <ScreenWrapper>
        <Header
          title="Account Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Account Not Found"
            message="This account could not be loaded"
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title={accountData.name}
        showBack
        rightElement={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditAccount", {
                accountId: accountData.id,
                account: accountData,
              })
            }
          >
            <Icon name="dots-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        {/* Account Hero */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View
              style={[
                styles.heroIcon,
                {
                  backgroundColor: getAccountColorBg(accountData.type),
                },
              ]}
            >
              <Icon
                name={getAccountIconName(accountData.type)}
                size={32}
                color={getAccountColor(accountData.type)}
              />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.accountType}>{accountData.type}</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(
                  accountData.balance || 0,
                  accountData.currency
                )}
              </Text>
              <Text style={styles.heroSubtitle}>Account Balance</Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statBox, { borderBottomColor: colors.primary }]}
          >
            <Text style={styles.statLabel}>Year</Text>
            <Text style={styles.statValue}>Income | Expense | Net</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, { borderBottomColor: colors.success }]}
          >
            <Text style={styles.statLabel}>Month</Text>
            <Text style={styles.statValue}>Income | Expense | Net</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {["ALL", "INCOME", "EXPENSE", "TRANSFER", "SETTLEMENT"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    filterType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Date Range Picker */}
        <View style={styles.datePickerSection}>
          <TouchableOpacity style={styles.datePickerButton}>
            <Icon name="calendar" size={18} color={colors.primary} />
            <Text style={styles.datePickerText}>Current Month</Text>
            <Icon name="chevron-down" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {transactions &&  transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={styles.transactionsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="receipt-outline"
                  title="No Transactions"
                  message="Start adding transactions to this account"
                />
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="receipt-outline"
              title="No Transactions"
              message="Add your first transaction to get started"
            />
          </View>
        )}
      </View>
      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const getAccountIconName = (type) => {
  const iconMap = {
    BANK: "bank",
    CREDIT_CARD: "credit-card",
    CASH: "cash-multiple",
    WALLET: "wallet",
    UPI: "mobile-pay",
  };
  return iconMap[type] || "wallet";
};

const getAccountColor = (type) => {
  const colorMap = {
    BANK: "#3B82F6",
    CREDIT_CARD: "#EF4444",
    CASH: "#10B981",
    WALLET: "#F59E0B",
    UPI: "#8B5CF6",
  };
  return colorMap[type] || "#64748B";
};

const getAccountColorBg = (type) => {
  const colorMap = {
    BANK: "#DBEAFE",
    CREDIT_CARD: "#FEE2E2",
    CASH: "#DCFCE7",
    WALLET: "#FEF3C7",
    UPI: "#EDE9FE",
  };
  return colorMap[type] || "#E2E8F0";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.white,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderBottomWidth: 3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    marginTop: 4,
  },
  filterBar: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  datePickerSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginHorizontal: 8,
  },
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  transactionDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AccountDetailScreen;
