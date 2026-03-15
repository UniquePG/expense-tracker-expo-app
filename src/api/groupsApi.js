import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const groupsApi = {
  getGroups: async (page = 1, limit = 20) => {
    const response = await axiosClient.get(API_ENDPOINTS.GROUPS.LIST, {
      params: {page, limit},
    });
    return response.data;
  },

  createGroup: async groupData => {
    const response = await axiosClient.post(API_ENDPOINTS.GROUPS.CREATE, groupData);
    return response.data;
  },

  getGroupDetails: async groupId => {
    const response = await axiosClient.get(API_ENDPOINTS.GROUPS.DETAIL(groupId));
    return response.data;
  },

  updateGroup: async (groupId, groupData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.GROUPS.UPDATE(groupId),
      groupData,
    );
    return response.data;
  },

  deleteGroup: async groupId => {
    const response = await axiosClient.delete(API_ENDPOINTS.GROUPS.DELETE(groupId));
    return response.data;
  },

  getGroupMembers: async groupId => {
    const response = await axiosClient.get(API_ENDPOINTS.GROUPS.MEMBERS(groupId));
    return response.data;
  },

  addMember: async (groupId, userId) => {
    const response = await axiosClient.post(API_ENDPOINTS.GROUPS.ADD_MEMBER(groupId), {
      userId,
    });
    return response.data;
  },

  removeMember: async (groupId, userId) => {
    const response = await axiosClient.delete(
      API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId),
    );
    return response.data;
  },

  getGroupExpenses: async (groupId, page = 1, limit = 20) => {
    const response = await axiosClient.get(API_ENDPOINTS.GROUPS.EXPENSES(groupId), {
      params: {page, limit},
    });
    return response.data;
  },

  settleGroup: async (groupId, settlementData) => {
    const response = await axiosClient.post(
      API_ENDPOINTS.GROUPS.SETTLE(groupId),
      settlementData,
    );
    return response.data;
  },
};