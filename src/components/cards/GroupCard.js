import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatCurrency';
import { Card } from '../ui/Card';

export const GroupCard = ({group, onPress, style}) => {
  const theme = useTheme();
  
  const memberCount = group.members?.length || 0;
  const totalExpenses = group.totalExpenses || 0;
  const userBalance = group.userBalance || 0;

  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: theme.colors.primaryLight},
          ]}>
          <Icon name="account-group" size={24} color={theme.colors.primary} />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={[styles.name, {color: theme.colors.text}]} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={[styles.members, {color: theme.colors.textSecondary}]}>
            {memberCount} members
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
            Total Expenses
          </Text>
          <Text style={[styles.amount, {color: theme.colors.text}]}>
            {formatCurrency(totalExpenses, group.currency)}
          </Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
            Your Balance
          </Text>
          <Text
            style={[
              styles.balance,
              {
                color: userBalance >= 0 ? theme.colors.income : theme.colors.expense,
              },
            ]}>
            {userBalance >= 0 ? '+' : ''}{formatCurrency(userBalance, group.currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  members: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
});