import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const groupsApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.BASE, { params });
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.ID(id));
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.GROUPS.ID(id), data);
    return response;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.GROUPS.ID(id));
    return response;
  },
  getMembers: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.MEMBERS(id));
    return response;
  },
  addMember: async (id, userId) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.MEMBERS(id), { userId });
    return response;
  },
  removeMember: async (groupId, userId) => {
    const response = await axiosClient.delete(`${ENDPOINTS.GROUPS.MEMBERS(groupId)}/${userId}`);
    return response;
  },
  getExpenses: async (id, params) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.EXPENSES(id), { params });
    return response;
  },
  getBalances: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.BALANCES(id));
    return response;
  },
  settle: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.SETTLE(id));
    return response;
  },
  uploadImage: async (id, formData) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  deleteImage: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.GROUPS.IMAGE(id));
    return response;
  },
};

export default groupsApi;
