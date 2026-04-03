import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatRelativeTime } from '../../utils/dateFormatter';
;

const NotificationCard = ({ notification, onPress }) => {
  const { title, message, isRead, createdAt, type } = notification;

  const getIcon = () => {
    switch (type) {
      case 'FRIEND_REQUEST': return 'account-plus';
      case 'EXPENSE_CREATED': return 'cash-plus';
      case 'SETTLEMENT_PENDING': return 'handshake';
      case 'GROUP_INVITE': return 'account-group';
      default: return 'bell';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !isRead && styles.unreadContainer]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, !isRead && styles.unreadIconContainer]}>
        <Icon name={getIcon()} size={24} color={!isRead ? colors.primary : colors.textSecondary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !isRead && styles.unreadText]}>{title}</Text>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <Text style={styles.time}>{formatRelativeTime(createdAt)}</Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadContainer: {
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadIconContainer: {
    backgroundColor: '#E0F2FE',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  unreadText: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: 8,
  },
});

export default NotificationCard;
