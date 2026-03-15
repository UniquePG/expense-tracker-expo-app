import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const settlementsApi = {
  getSettlements: async (params = {}) => {
    const {page = 1, limit = 20, status, friendId} = params;
    const response = await axiosClient.get(API_ENDPOINTS.SETTLEMENTS.LIST, {
      params: {page, limit, status, friendId},
    });
    return response.data;
  },

  createSettlement: async settlementData => {
    const response = await axiosClient.post(
      API_ENDPOINTS.SETTLEMENTS.CREATE,
      settlementData,
    );
    return response.data;
  },

  getSettlementDetails: async settlementId => {
    const response = await axiosClient.get(
      API_ENDPOINTS.SETTLEMENTS.DETAIL(settlementId),
    );
    return response.data;
  },

  updateSettlement: async (settlementId, settlementData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.SETTLEMENTS.UPDATE(settlementId),
      settlementData,
    );
    return response.data;
  },

  deleteSettlement: async settlementId => {
    const response = await axiosClient.delete(
      API_ENDPOINTS.SETTLEMENTS.DELETE(settlementId),
    );
    return response.data;
  },
};