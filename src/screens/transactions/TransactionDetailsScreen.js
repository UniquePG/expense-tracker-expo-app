import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Divider from '../../components/ui/Divider';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';
;

const TransactionDetailsScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const { fetchTransactionById, deleteTransaction, isLoading } = useTransactions();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const data = await fetchTransactionById(transactionId);
      setTransaction(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert('Success', 'Transaction deleted');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        },
      ]
    );
  };

  if (!transaction && !isLoading) return null;

  const isExpense = transaction?.type === 'expense';

  return (
    <ScreenWrapper>
      <Header 
        title="Transaction Details" 
        showBack 
        rightIcon="delete-outline" 
        onRightPress={handleDelete}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5' }]}>
            <Icon 
              name={isExpense ? 'arrow-up-circle' : 'arrow-down-circle'} 
              size={48} 
              color={isExpense ? colors.error : colors.success} 
              accessibilityLabel={isExpense ? 'Expense' : 'Income'}
            />
          </View>
          <Text style={styles.amount}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction?.amount)}
          </Text>
          <Text style={styles.description}>{transaction?.description}</Text>
          <Badge 
            label={transaction?.category?.name || 'Uncategorized'} 
            type="primary" 
            style={styles.badge} 
          />
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(transaction?.date, 'MMMM D, YYYY')}</Text>
          </View>
          <Divider />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{transaction?.type}</Text>
          </View>
          <Divider />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>{transaction?.account?.name || 'Default Account'}</Text>
          </View>
          {transaction?.notes && (
            <>
              <Divider />
              <View style={styles.notesSection}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.notesText}>{transaction.notes}</Text>
              </View>
            </>
          )}
        </Card>

        {transaction?.expenseId && (
          <TouchableOpacity 
            style={styles.relatedBtn} 
            onPress={() => navigation.navigate('ExpenseDetails', { expenseId: transaction.expenseId })}
          >
            <Icon name="link-variant" size={20} color={colors.primary} />
            <Text style={styles.relatedText}>View Related Expense</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </ScrollView>
      <LoadingOverlay visible={isLoading && !transaction} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    marginTop: 12,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  notesSection: {
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  relatedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  relatedText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default TransactionDetailsScreen;
