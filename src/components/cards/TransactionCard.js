import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatShortDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';
import { Card } from '../ui/Card';

export const TransactionCard = ({
  transaction,
  onPress,
  showDate = true,
  style,
}) => {
  const theme = useTheme();
  const {description, amount, type, category, date, user} = transaction;
  
  const isIncome = type === 'income';
  const amountColor = isIncome ? theme.colors.income : theme.colors.expense;
  const iconName = category?.icon || (isIncome ? 'arrow-down' : 'arrow-up');

  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: isIncome ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'},
          ]}>
          <Icon
            name={iconName}
            size={24}
            color={amountColor}
          />
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.description, {color: theme.colors.text}]} numberOfLines={1}>
            {description}
          </Text>
          <Text style={[styles.category, {color: theme.colors.textSecondary}]}>
            {category?.name || (isIncome ? 'Income' : 'Expense')}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text style={[styles.amount, {color: amountColor}]}>
            {isIncome ? '+' : '-'}{formatCurrency(amount, transaction.currency)}
          </Text>
          {showDate && (
            <Text style={[styles.date, {color: theme.colors.textSecondary}]}>
              {formatShortDate(date)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
  },
  category: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
});