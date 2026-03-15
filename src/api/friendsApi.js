import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const friendsApi = {
  getFriends: async (page = 1, limit = 20) => {
    const response = await axiosClient.get(API_ENDPOINTS.FRIENDS.LIST, {
      params: {page, limit},
    });
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.FRIENDS.REQUESTS);
    return response.data;
  },

  sendFriendRequest: async email => {
    const response = await axiosClient.post(API_ENDPOINTS.FRIENDS.SEND_REQUEST, {
      email,
    });
    return response.data;
  },

  acceptFriendRequest: async requestId => {
    const response = await axiosClient.post(
      API_ENDPOINTS.FRIENDS.ACCEPT_REQUEST(requestId),
    );
    return response.data;
  },

  rejectFriendRequest: async requestId => {
    const response = await axiosClient.post(
      API_ENDPOINTS.FRIENDS.REJECT_REQUEST(requestId),
    );
    return response.data;
  },

  removeFriend: async friendId => {
    const response = await axiosClient.delete(API_ENDPOINTS.FRIENDS.REMOVE(friendId));
    return response.data;
  },

  getBalances: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.FRIENDS.BALANCES);
    return response.data;
  },
};