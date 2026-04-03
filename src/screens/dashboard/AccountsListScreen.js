import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/buttons/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Header from "../../components/ui/Header";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import ScreenWrapper from "../../components/ui/ScreenWrapper";
import { colors } from "../../constants/colors";
import { useAccounts } from "../../hooks/useAccounts";
import { formatCurrency } from "../../utils/formatCurrency";
;

const AccountsListScreen = ({ navigation }) => {
  const { accounts, totalBalance, isLoading, fetchAccounts, deleteAccount } =
    useAccounts();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleDeleteAccount = (accountId, accountName) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${accountName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(accountId);
              Alert.alert("Success", "Account deleted successfully");
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete account"
              );
            }
          },
        },
      ]
    );
  };

  const handleAccountPress = (account) => {
    navigation.navigate("AccountDetail", {
      accountId: account.id,
      account,
    });
  };

  const handleEditAccount = (account) => {
    navigation.navigate("EditAccount", { accountId: account.id, account });
  };

  const getAccountIcon = (type) => {
    const iconMap = {
      BANK: "bank",
      CREDIT_CARD: "credit-card",
      CASH: "cash",
      WALLET: "wallet",
      UPI: "cellphone",
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

  const renderAccountCard = ({ item: account }) => (
    <Card style={styles.accountCard}>
      <TouchableOpacity
        style={styles.accountContent}
        onPress={() => handleAccountPress(account)}
      >
        <View
          style={[
            styles.accountIcon,
            { backgroundColor: getAccountColor(account.type) },
          ]}
        >
          <Icon
            name={getAccountIcon(account.type)}
            size={28}
            color="#FFF"
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>{account.type}</Text>
        </View>
        <View style={styles.accountBalance}>
          <Text style={styles.balanceAmount}>
            {formatCurrency(account.balance || 0, account.currency)}
          </Text>
          <Text style={styles.accountTypeBadge}>{account.currency}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAccount(account)}
        >
          <Icon name="pencil" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            handleDeleteAccount(account.id, account.name)
          }
        >
          <Icon name="trash-can-outline" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <Header
        title="My Accounts"
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate("AddAccount")}
          >
            <Icon name="plus" size={28} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        {/* Total Balance Card */}
        {totalBalance && (
          <Card style={styles.totalBalanceCard}>
            <View style={styles.totalBalanceContent}>
              <Text style={styles.totalBalanceLabel}>Total Balance</Text>
              <Text style={styles.totalBalanceAmount}>
                {formatCurrency(
                  totalBalance?.totalBalance || 0,
                  totalBalance?.currency || "INR"
                )}
              </Text>
              <Text style={styles.totalBalanceSubtitle}>
                Across {accounts?.length || 0} accounts
              </Text>
            </View>
          </Card>
        )}

        {/* Accounts List */}
        {accounts && accounts.length > 0 ? (
          <FlatList
            data={accounts}
            renderItem={renderAccountCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyStateWrapper}>
            <EmptyState
              icon="wallet-outline"
              title="No Accounts Yet"
              message="Create your first account to start tracking expenses"
            />
            <Button
              title="+ Create First Account"
              onPress={() => navigation.navigate("AddAccount")}
              style={styles.emptyStateButton}
            />
          </View>
        )}
      </View>

      {/* Floating Add Button */}
      {accounts && accounts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddAccount")}
        >
          <Icon name="plus" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  totalBalanceCard: {
    marginBottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  totalBalanceContent: {
    alignItems: "center",
    width: "100%",
  },
  totalBalanceLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
  },
  totalBalanceSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  accountType: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountBalance: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 4,
  },
  accountTypeBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  accountActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 6,
  },
  divider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateButton: {
    marginTop: 24,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default AccountsListScreen;

