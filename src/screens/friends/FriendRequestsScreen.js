import React from 'react';
import {View, StyleSheet, FlatList, Alert} from 'react-native';
import {Text, useTheme, Button, Avatar} from 'react-native-paper';
import {useFriends} from '../../hooks/useFriends';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {Card} from '../../components/ui/Card';
import {EmptyState} from '../../components/ui/EmptyState';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {formatDate} from '../../utils/dateFormatter';

export const FriendRequestsScreen = ({navigation}) => {
  const theme = useTheme();
  const {
    friendRequests,
    isLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    refreshRequests,
  } = useFriends();

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this friend request?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectFriendRequest(requestId);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({item}) => {
    const isIncoming = item.direction === 'incoming';
    const user = isIncoming ? item.fromUser : item.toUser;

    return (
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Avatar.Text
            size={48}
            label={`${user.firstName[0]}${user.lastName[0]}`}
            style={{backgroundColor: theme.colors.primary}}
          />
          <View style={styles.requestInfo}>
            <Text style={[styles.userName, {color: theme.colors.text}]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.userEmail, {color: theme.colors.textSecondary}]}>
              {user.email}
            </Text>
            <Text style={[styles.requestDate, {color: theme.colors.textDisabled}]}>
              {isIncoming ? 'Received ' : 'Sent '}{formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {isIncoming ? (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleAccept(item.id)}
              style={[styles.actionButton, {flex: 1}]}>
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleReject(item.id)}
              style={[styles.actionButton, {flex: 1, marginLeft: 8}]}
              textColor={theme.colors.error}>
              Decline
            </Button>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={[styles.pendingText, {color: theme.colors.warning}]}>
              Pending
            </Text>
          </View>
        )}
      </Card>
    );
  };

  if (!isLoading && friendRequests.length === 0) {
    return (
      <ScreenWrapper safeArea={true}>
        <Header title="Friend Requests" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="account-check"
          title="No pending requests"
          message="You don't have any friend requests at the moment"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Friend Requests" onBack={() => navigation.goBack()} />

      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        contentContainerStyle={styles.listContent}
        onRefresh={refreshRequests}
        refreshing={isLoading}
      />

      <LoadingOverlay visible={isLoading && friendRequests.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  requestCard: {
    marginBottom: 12,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  requestDate: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
  },
  pendingBadge: {
    alignItems: 'flex-end',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});