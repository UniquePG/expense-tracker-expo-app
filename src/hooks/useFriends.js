import { useEffect } from 'react';
import { useFriendsStore } from '../store/friendsStore';

export const useFriends = () => {
  const { friends, balances, pendingRequests, isLoading, error, fetchFriends, fetchBalances, fetchPendingRequests, sendFriendRequest } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
    fetchBalances();
    fetchPendingRequests();
  }, []);

  return {
    friends,
    balances,
    pendingRequests,
    isLoading,
    error,
    fetchFriends,
    fetchBalances,
    fetchPendingRequests,
    sendFriendRequest,
  };
};

export default useFriends;
