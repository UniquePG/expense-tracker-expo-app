import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';
;

const TransactionCard = ({ transaction, onPress }) => {
  const { description, amount, type, transactionDate } = transaction;
  const isIncome = type === 'INCOME';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#ECFDF5' : '#FEF2F2' }]}>
        <Icon 
          name={isIncome ? 'arrow-down-bold' : 'arrow-up-bold'} 
          size={24} 
          color={isIncome ? colors.success : colors.error} 
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>{formatDate(transactionDate)}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isIncome ? colors.success : colors.error }]}>
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TransactionCard;
