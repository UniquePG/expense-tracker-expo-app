import { useFriendsStore } from '../store/friendsStore';

export const useFriends = () => {
  const store = useFriendsStore();

  return {
    friends: store.friends,
    balances: store.balances,
    pendingRequests: store.pendingRequests,
    requests: store.requests,
    friendDetails: store.friendDetails,
    isLoading: store.isLoading,
    error: store.error,

    fetchFriends: store.fetchFriends,
    fetchBalances: store.fetchBalances,
    fetchPendingRequests: store.fetchPendingRequests,
    fetchRequests: store.fetchRequests,
    sendFriendRequest: store.sendFriendRequest,
    acceptFriendRequest: store.acceptFriendRequest,
    rejectFriendRequest: store.rejectFriendRequest,
    removeFriend: store.removeFriend,
    getFriendDetails: store.getFriendDetails,
    blockFriend: store.blockFriend,
  };
};

export default useFriends;
