import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';

const FriendRequestsScreen = () => {
  const { friendRequests, fetchFriends, acceptFriendRequest, rejectFriendRequest, isLoading } = useFriends();

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id);
      Alert.alert('Success', 'Friend request accepted');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriendRequest(id);
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const RequestItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <Avatar source={item.fromUserAvatar} name={item.fromUserName} size={50} radius={25} />
        <View style={styles.itemContent}>
          <Text style={styles.name}>{item.fromUserName}</Text>
          <Text style={styles.email}>{item.fromUserEmail}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn]} 
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleReject(item.id)}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Friend Requests" showBack />
      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RequestItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchFriends} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="account-question"
              title="No Pending Requests"
              description="You don't have any new friend requests at the moment."
            />
          )
        }
      />
      <LoadingOverlay visible={isLoading && friendRequests.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
  },
  rejectBtn: {
    backgroundColor: '#F3F4F6',
  },
  acceptText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  rejectText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default FriendRequestsScreen;
