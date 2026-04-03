import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import NotificationCard from '../../components/cards/NotificationCard';
import EmptyState from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const NotificationsScreen = ({ navigation }) => {
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead 
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length > 0) {
        await markAsRead(unreadIds);
      }
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead([notification.id]);
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }

    // Navigate based on type
    switch (notification.type) {
      case 'friend_request':
        navigation.navigate('FriendRequests');
        break;
      case 'expense_added':
      case 'expense_updated':
        navigation.navigate('ExpenseDetails', { expenseId: notification.data?.expenseId });
        break;
      case 'settlement_received':
        navigation.navigate('Settlements');
        break;
      case 'group_invite':
        navigation.navigate('GroupDetails', { groupId: notification.data?.groupId });
        break;
      default:
        break;
    }
  };

  return (
    <ScreenWrapper>
      <Header 
        title="Notifications" 
        showBack 
        rightIcon="check-all" 
        onRightPress={handleMarkAllRead}
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard 
            notification={item} 
            onPress={() => handleNotificationPress(item)} 
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={fetchNotifications} 
            colors={[colors.primary]} 
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="bell-off"
              title="No Notifications"
              description="You're all caught up! No new notifications."
            />
          )
        }
      />
      <LoadingOverlay visible={isLoading && notifications.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default NotificationsScreen;
