import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { formatDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';

export const SettlementCard = ({
  settlement,
  onPress,
  onSettle,
  showActions = true,
  style,
}) => {
  const theme = useTheme();
  
  const {amount, currency, toUser, fromUser, status, date, notes} = settlement;
  const isPending = status === 'pending';
  const isReceived = toUser?.isCurrentUser;

  return (
    <Card onPress={onPress} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.usersContainer}>
          <Avatar
            source={fromUser?.avatar ? {uri: fromUser.avatar} : null}
            firstName={fromUser?.firstName}
            lastName={fromUser?.lastName}
            size={36}
          />
          <Icon
            name="arrow-right"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.arrow}
          />
          <Avatar
            source={toUser?.avatar ? {uri: toUser.avatar} : null}
            firstName={toUser?.firstName}
            lastName={toUser?.lastName}
            size={36}
          />
        </View>
        
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending ? theme.colors.warning : theme.colors.success,
            },
          ]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.amount, {color: theme.colors.text}]}>
          {formatCurrency(amount, currency)}
        </Text>
        <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
          {fromUser?.firstName} paid {toUser?.firstName}
        </Text>
        {notes && (
          <Text style={[styles.notes, {color: theme.colors.textSecondary}]}>
            "{notes}"
          </Text>
        )}
        <Text style={[styles.date, {color: theme.colors.textDisabled}]}>
          {formatDate(date)}
        </Text>
      </View>

      {showActions && isPending && isReceived && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={onSettle}
            style={styles.settleButton}>
            Confirm Receipt
          </Button>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  settleButton: {
    width: '100%',
  },
});