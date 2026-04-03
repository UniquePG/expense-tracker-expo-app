import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';
;

const SettlementCard = ({ settlement, onPress, isReceived }) => {
  const { fromUser, toUser, amount, status, createdAt } = settlement;
  const otherUser = isReceived ? fromUser : toUser;
  const fullName = `${otherUser.firstName} ${otherUser.lastName}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name="handshake" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isReceived ? `From ${fullName}` : `To ${fullName}`}
        </Text>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status === 'CONFIRMED' ? '#ECFDF5' : '#FFFBEB' }]}>
          <Text style={[styles.statusText, { color: status === 'CONFIRMED' ? colors.success : colors.warning }]}>
            {status}
          </Text>
        </View>
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
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
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
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default SettlementCard;
