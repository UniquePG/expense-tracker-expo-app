import {useCallback, useEffect} from 'react';
import {useFriendsStore} from '../store/friendsStore';

export const useFriends = (options = {}) => {
  const {autoFetch = true} = options;

  const {
    friends,
    friendRequests,
    balances,
    isLoading,
    error,
    fetchFriends,
    fetchFriendRequests,
    fetchBalances,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    clearError,
  } = useFriendsStore();

  useEffect(() => {
    if (autoFetch) {
      fetchFriends();
      fetchFriendRequests();
      fetchBalances();
    }
  }, [autoFetch]);

  const handleSendRequest = useCallback(async email => {
    try {
      await sendFriendRequest(email);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [sendFriendRequest]);

  const handleAcceptRequest = useCallback(async requestId => {
    try {
      await acceptFriendRequest(requestId);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [acceptFriendRequest]);

  const handleRejectRequest = useCallback(async requestId => {
    try {
      await rejectFriendRequest(requestId);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [rejectFriendRequest]);

  const handleRemoveFriend = useCallback(async friendId => {
    try {
      await removeFriend(friendId);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [removeFriend]);

  const getFriendBalance = useCallback(friendId => {
    return balances.find(b => b.friendId === friendId);
  }, [balances]);

  return {
    friends,
    friendRequests,
    balances,
    isLoading,
    error,
    refresh: fetchFriends,
    refreshRequests: fetchFriendRequests,
    refreshBalances: fetchBalances,
    sendFriendRequest: handleSendRequest,
    acceptFriendRequest: handleAcceptRequest,
    rejectFriendRequest: handleRejectRequest,
    removeFriend: handleRemoveFriend,
    getFriendBalance,
    clearError,
  };
};