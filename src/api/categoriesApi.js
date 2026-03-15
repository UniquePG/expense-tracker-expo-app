import axiosClient from './axiosClient';
import {API_ENDPOINTS} from '../constants/apiEndpoints';

export const categoriesApi = {
  getCategories: async (type) => {
    const response = await axiosClient.get(API_ENDPOINTS.CATEGORIES.LIST, {
      params: {type},
    });
    return response.data;
  },

  createCategory: async categoryData => {
    const response = await axiosClient.post(
      API_ENDPOINTS.CATEGORIES.CREATE,
      categoryData,
    );
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await axiosClient.put(
      API_ENDPOINTS.CATEGORIES.UPDATE(categoryId),
      categoryData,
    );
    return response.data;
  },

  deleteCategory: async categoryId => {
    const response = await axiosClient.delete(
      API_ENDPOINTS.CATEGORIES.DELETE(categoryId),
    );
    return response.data;
  },
};