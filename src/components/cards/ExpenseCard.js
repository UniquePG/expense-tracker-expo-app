import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {Card} from '../ui/Card';
import {Avatar} from '../ui/Avatar';
import {formatCurrency} from '../../utils/formatCurrency';
import {formatShortDate} from '../../utils/dateFormatter';

export const ExpenseCard = ({expense, onPress, showPayer = true, style}) => {
  const theme = useTheme();
  
  const {description, amount, currency, paidBy, createdAt, userShare} = expense;
  const isPaidByUser = paidBy?.isCurrentUser;
  
  let shareText;
  let shareColor;
  
  if (userShare === 0) {
    shareText = 'Not involved';
    shareColor = theme.colors.textSecondary;
  } else if (isPaidByUser) {
    shareText = `you lent ${formatCurrency(amount - userShare, currency)}`;
    shareColor = theme.colors.income;
  } else {
    shareText = `you borrowed ${formatCurrency(userShare, currency)}`;
    shareColor = theme.colors.expense;
  }

  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.dateContainer}>
          <Text style={[styles.month, {color: theme.colors.textSecondary}]}>
            {formatShortDate(createdAt).split(' ')[0]}
          </Text>
          <Text style={[styles.day, {color: theme.colors.text}]}>
            {new Date(createdAt).getDate()}
          </Text>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.description, {color: theme.colors.text}]} numberOfLines={1}>
            {description}
          </Text>
          {showPayer && (
            <Text style={[styles.payer, {color: theme.colors.textSecondary}]}>
              {isPaidByUser ? 'You' : paidBy?.firstName} paid {formatCurrency(amount, currency)}
            </Text>
          )}
        </View>

        <View style={styles.shareContainer}>
          <Text style={[styles.shareText, {color: shareColor}]}>
            {shareText}
          </Text>
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
  dateContainer: {
    alignItems: 'center',
    width: 50,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 12,
  },
  month: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  day: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
  },
  payer: {
    fontSize: 12,
    marginTop: 2,
  },
  shareContainer: {
    alignItems: 'flex-end',
    maxWidth: 100,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
});