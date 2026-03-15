import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { Card } from '../ui/Card';

export const NotificationCard = ({
  notification,
  onPress,
  onDelete,
  style,
}) => {
  const theme = useTheme();
  
  const {type, title, message, read, createdAt, sender} = notification;
  
  const getIcon = () => {
    switch (type) {
      case 'friend_request':
        return 'account-plus';
      case 'expense_created':
        return 'cash-plus';
      case 'settlement_completed':
        return 'check-circle';
      case 'group_invite':
        return 'account-group';
      default:
        return 'bell';
    }
  };

  return (
    <Card style={[styles.container, !read && styles.unread, style]}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: read ? theme.colors.surface : theme.colors.primaryLight},
          ]}>
          <Icon
            name={getIcon()}
            size={24}
            color={read ? theme.colors.textSecondary : theme.colors.primary}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, {color: theme.colors.text}]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.message, {color: theme.colors.textSecondary}]} numberOfLines={2}>
            {message}
          </Text>
          <Text style={[styles.time, {color: theme.colors.textDisabled}]}>
            {formatRelativeTime(createdAt)}
          </Text>
        </View>

        {!read && <View style={[styles.unreadDot, {backgroundColor: theme.colors.primary}]} />}
      </TouchableOpacity>
      
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Icon name="close" size={20} color={theme.colors.textDisabled} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
  },
  unread: {
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});