import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

export const contactsApi = {
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.CONTACTS.BASE, data);
    return response;
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.CONTACTS.BASE, { params });
    return response;
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.CONTACTS.ID(id));
    return response;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.CONTACTS.ID(id), data);
    return response;
  },
  remove: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.CONTACTS.ID(id));
    return response;
  },
  link: async (id, userId) => {
    const response = await axiosClient.post(ENDPOINTS.CONTACTS.LINK(id), { userId });
    return response;
  },
};

export default contactsApi;
