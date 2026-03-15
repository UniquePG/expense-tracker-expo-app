import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {Card} from '../ui/Card';
import {Avatar} from '../ui/Avatar';
import {formatCurrency} from '../../utils/formatCurrency';

export const FriendCard = ({friend, balance, onPress, style}) => {
  const theme = useTheme();
  
  const balanceAmount = balance?.amount || 0;
  const isOwed = balanceAmount > 0;
  const isSettled = balanceAmount === 0;
  
  let balanceText;
  let balanceColor;
  
  if (isSettled) {
    balanceText = 'All settled up';
    balanceColor = theme.colors.textSecondary;
  } else if (isOwed) {
    balanceText = `owes you ${formatCurrency(balanceAmount, balance.currency)}`;
    balanceColor = theme.colors.income;
  } else {
    balanceText = `you owe ${formatCurrency(Math.abs(balanceAmount), balance.currency)}`;
    balanceColor = theme.colors.expense;
  }

  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.row}>
        <Avatar
          source={friend.avatar ? {uri: friend.avatar} : null}
          firstName={friend.firstName}
          lastName={friend.lastName}
          size={48}
        />
        
        <View style={styles.content}>
          <Text style={[styles.name, {color: theme.colors.text}]}>
            {friend.firstName} {friend.lastName}
          </Text>
          <Text style={[styles.email, {color: theme.colors.textSecondary}]}>
            {friend.email}
          </Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText, {color: balanceColor}]}>
            {balanceText}
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
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    maxWidth: 120,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
});