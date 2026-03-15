import { useCallback } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { NotificationCard } from '../../components/cards/NotificationCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useFriends } from '../../hooks/useFriends';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/dateFormatter';

export const NotificationsScreen = ({navigation}) => {
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({autoFetch: true});
  
  const {acceptFriendRequest, rejectFriendRequest} = useFriends();

  const handleNotificationPress = useCallback(async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'friend_request':
        navigation.navigate('FriendRequests');
        break;
      case 'expense_created':
      case 'expense_updated':
        if (notification.data?.expenseId) {
          navigation.navigate('ExpenseDetails', {id: notification.data.expenseId});
        }
        break;
      case 'settlement_request':
      case 'settlement_completed':
        navigation.navigate('Settlements');
        break;
      case 'group_invite':
      case 'group_joined':
        if (notification.data?.groupId) {
          navigation.navigate('GroupDetails', {id: notification.data.groupId});
        }
        break;
      default:
        break;
    }
  }, [markAsRead, navigation]);

  const handleAction = useCallback(async (notification, action) => {
    try {
      switch (notification.type) {
        case 'friend_request':
          if (action === 'accept') {
            await acceptFriendRequest(notification.data.requestId);
          } else {
            await rejectFriendRequest(notification.data.requestId);
          }
          await markAsRead(notification.id);
          break;
        case 'group_invite':
          if (action === 'accept') {
            // API call to accept group invite
          } else {
            // API call to decline group invite
          }
          await markAsRead(notification.id);
          break;
        default:
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process action');
    }
  }, [acceptFriendRequest, rejectFriendRequest, markAsRead]);

  const handleDelete = useCallback((notification) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  }, [deleteNotification]);

  const renderNotificationItem = ({item}) => (
    <NotificationCard
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="bell-off"
      title="No notifications"
      message="You're all caught up! Check back later for updates."
    />
  );

  const groupNotificationsByDate = (notifications) => {
    const grouped = {};
    notifications.forEach(notification => {
      const date = formatDate(notification.createdAt, 'YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, items]) => ({
        title: date === formatDate(new Date(), 'YYYY-MM-DD') ? 'Today' : 
               date === formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD') ? 'Yesterday' :
               formatDate(date, 'MMMM D, YYYY'),
        data: items,
      }));
  };

  const groupedData = groupNotificationsByDate(notifications);

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <IconButton
              icon="check-all"
              size={24}
              onPress={markAllAsRead}
              iconColor={theme.colors.primary}
            />
          ) : null
        }
      />

      {notifications.length === 0 && !isLoading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.title}
          renderItem={({item}) => (
            <View>
              <Text style={[styles.sectionHeader, {color: theme.colors.textSecondary}]}>
                {item.title}
              </Text>
              {item.data.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                  onDelete={() => handleDelete(notification)}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <LoadingOverlay visible={isLoading && notifications.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
});