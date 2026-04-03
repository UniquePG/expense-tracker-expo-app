import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import BalanceCard from "../../components/cards/BalanceCard";
import ExpenseCard from "../../components/cards/ExpenseCard";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { colors } from "../../constants/colors";
import { useUserStore } from "../../store/userStore";
import { formatCurrency } from "../../utils/formatCurrency";

const DashboardScreen = ({ navigation }) => {
  const {
    dashboardData,
    isLoading,
    fetchDashboard,
    profile: user,
  } = useUserStore();
  console.log('dashboardData :', dashboardData);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchDashboard();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const summary = dashboardData?.overview || {};
  const accounts = dashboardData?.accounts || {};
  const recentTransactions = dashboardData?.recentTransactions || [];
  const activeGroups = dashboardData?.activeGroups || [];
  const budgetAlerts = dashboardData?.budgetAlerts || [];
  const pendingSettlements = dashboardData?.pendingSettlements || [];
  
  console.log('recentTransactions :', recentTransactions);
  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  const handleAccountsPress = () => {
    navigation.navigate("AccountsList");
  };

  const handleAddExpense = () => {
    navigation.navigate("AddExpense");
  };

  const handleAddIncome = () => {
    navigation.navigate("AddIncome");
  };

  const handleViewAllTransactions = () => {
    navigation.navigate("TransactionList");
  };

  const handleViewAllGroups = () => {
    navigation.navigate("Groups");
  };

  const handleViewAllSettlements = () => {
    navigation.navigate("Settlements");
  };

  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionDetails", {
      transactionId: transaction.id,
    });
  };

  const handleGroupPress = (group) => {
    navigation.navigate("GroupDetails", { groupId: group.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={handleProfilePress}
          >
            <Avatar
              source={user?.avatar}
              name={`${user?.firstName} ${user?.lastName}`}
              size={40}
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{user?.firstName || "User"}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={handleNotificationPress}
          >
            <Icon name="bell-outline" size={24} color={colors.primary} />
            {dashboardData?.unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {dashboardData.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View style={styles.balanceSection}>
          <BalanceCard
            balance={summary.totalBalance || 0}
            label="Total Balance"
            subLabel={`Across ${accounts.count || 0} accounts`}
            currency={user?.currency || "INR"}
          />
        </View>

        {/* Split Summary Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
              <Icon name="arrow-down" size={20} color={colors.success} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {formatCurrency(summary.totalIncome || 0, user?.currency)}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF2F2" }]}>
              <Icon name="arrow-up" size={20} color={colors.error} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {formatCurrency(summary.totalExpenses || 0, user?.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleAddIncome}
          >
            <Icon name="plus-circle" size={20} color={colors.white} />
            <Text style={styles.actionText}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#1E293B" }]}
            onPress={handleAddExpense}
          >
            <Icon name="minus-circle" size={20} color={colors.white} />
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Manage Accounts Button */}
        <View style={styles.accountsRow}>
          <TouchableOpacity
            style={styles.accountsBtn}
            onPress={handleAccountsPress}
          >
            <Icon name="wallet-outline" size={20} color={colors.primary} />
            <View style={styles.accountsTextContainer}>
              <Text style={styles.accountsBtnText}>Manage Accounts</Text>
              <Text style={styles.accountsSubText}>Bank, Cash, Cards</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Budget Alerts */}
        {budgetAlerts && budgetAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Alerts</Text>
            </View>
            {budgetAlerts.slice(0, 2).map((alert) => (
              <Card key={alert.id} style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          alert.percentage > 80 ? "#FEF2F2" : "#FEF3C7",
                      },
                    ]}
                  >
                    <Icon
                      name={
                        alert.percentage > 80 ? "alert-circle" : "alert"
                      }
                      size={20}
                      color={alert.percentage > 80 ? colors.error : "#F59E0B"}
                    />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.name}</Text>
                    <Text style={styles.alertDescription}>
                      {alert.percentage}% used ({formatCurrency(alert.spent, user?.currency)} of{" "}
                      {formatCurrency(alert.limit, user?.currency)})
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Recent Expenses */}
        {recentTransactions && recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              <TouchableOpacity onPress={handleViewAllTransactions}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.slice(0, 5).map((transaction) => (
              <ExpenseCard
                key={transaction.id}
                expense={transaction}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))}
          </View>
        )}

        {/* Active Groups */}
        {activeGroups && activeGroups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Groups</Text>
              <TouchableOpacity onPress={handleViewAllGroups}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeGroups.slice(0, 3)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item: group }) => (
                <TouchableOpacity
                  style={styles.groupCard}
                  onPress={() => handleGroupPress(group)}
                >
                  <View style={styles.groupIcon}>
                    <Icon name="account-multiple" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupMembers}>
                    {group.memberCount} members
                  </Text>
                </TouchableOpacity>
              )}
              scrollEventThrottle={16}
            />
          </View>
        )}

        {/* Pending Settlements */}
        {pendingSettlements && pendingSettlements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Settlements</Text>
              <TouchableOpacity onPress={handleViewAllSettlements}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {pendingSettlements.slice(0, 3).map((settlement) => (
              <Card key={settlement.id} style={styles.settlementCard}>
                <View style={styles.settlementContent}>
                  <View style={styles.settlementInfo}>
                    <Text style={styles.settlementTitle}>
                      {settlement.fromUserName} → {settlement.toUserName}
                    </Text>
                    <Text style={styles.settlementAmount}>
                      {formatCurrency(settlement.amount, user?.currency)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.settlementBadge,
                      {
                        backgroundColor:
                          settlement.status === "PENDING"
                            ? "#FEF3C7"
                            : "#E0E7FF",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.settlementBadgeText,
                        {
                          color:
                            settlement.status === "PENDING"
                              ? "#92400E"
                              : "#3730A3",
                        },
                      ]}
                    >
                      {settlement.status}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {(!recentTransactions || recentTransactions.length === 0) &&
          (!activeGroups || activeGroups.length === 0) && (
            <View style={styles.emptyContainer}>
              <Icon name="inbox-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>All set!</Text>
              <Text style={styles.emptySubText}>Start adding expenses and groups</Text>
            </View>
          )}
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  balanceSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  accountsRow: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  accountsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountsTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  accountsBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  accountsSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  alertDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  groupCard: {
    width: 100,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  groupMembers: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  settlementCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  settlementContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settlementInfo: {
    flex: 1,
  },
  settlementTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  settlementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settlementBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
});

export default DashboardScreen;

 