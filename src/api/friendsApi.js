import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const friendsApi = {
  sendRequest: async (email) => {
    const response = await axiosClient.post(ENDPOINTS.FRIENDS.REQUEST, { email });
    return response;
  },
  getRequests: async () => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.REQUESTS);
    return response;
  },
  getPendingRequests: async () => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.PENDING);
    return response;
  },
  getSentRequests: async () => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.SENT);
    return response;
  },
  acceptRequest: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.FRIENDS.ACCEPT(id));
    return response;
  },
  rejectRequest: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.FRIENDS.REJECT(id));
    return response;
  },
  getAll: async () => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.BASE);
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.DETAILS(id));
    return response;
  },
  remove: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.FRIENDS.DETAILS(id));
    return response;
  },
  getBalances: async () => {
    const response = await axiosClient.get(ENDPOINTS.FRIENDS.BALANCES);
    return response;
  },
};

export default friendsApi;
