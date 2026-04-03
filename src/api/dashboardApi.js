import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const dashboardApi = {
  getSummary: async () => {
    const response = await axiosClient.get(ENDPOINTS.DASHBOARD.BASE);
    return response;
  },
  getStats: async () => {
    const response = await axiosClient.get(ENDPOINTS.DASHBOARD.STATS);
    return response;
  },
  getTrends: async () => {
    const response = await axiosClient.get(ENDPOINTS.DASHBOARD.TRENDS);
    return response;
  },
  getFriendBalances: async () => {
    const response = await axiosClient.get(ENDPOINTS.DASHBOARD.FRIEND_BALANCES);
    return response;
  },
};

export default dashboardApi;
