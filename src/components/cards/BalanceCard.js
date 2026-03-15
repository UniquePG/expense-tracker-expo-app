import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {Card} from '../ui/Card';
import {formatCurrency} from '../../utils/formatCurrency';

export const BalanceCard = ({
  title,
  amount,
  currency = 'USD',
  subtitle,
  trend,
  trendUp,
  style,
}) => {
  const theme = useTheme();
  const isPositive = amount >= 0;
  const amountColor = isPositive ? theme.colors.income : theme.colors.expense;

  return (
    <Card style={[styles.container, style]}>
      <Text style={[styles.title, {color: theme.colors.textSecondary}]}>
        {title}
      </Text>
      <Text style={[styles.amount, {color: amountColor}]}>
        {formatCurrency(amount, currency)}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {subtitle}
        </Text>
      )}
      {trend && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trend,
              {color: trendUp ? theme.colors.income : theme.colors.expense},
            ]}>
            {trendUp ? '↑' : '↓'} {trend}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 150,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 12,
  },
  trendContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});