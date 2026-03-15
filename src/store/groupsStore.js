import {create} from 'zustand';
import {groupsApi} from '../api/groupsApi';

export const useGroupsStore = create((set, get) => ({
  // State
  groups: [],
  currentGroup: null,
  groupExpenses: [],
  isLoading: false,
  error: null,

  // Actions
  fetchGroups: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await groupsApi.getGroups();
      set({groups: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch groups',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchGroupDetails: async groupId => {
    set({isLoading: true, error: null});
    try {
      const response = await groupsApi.getGroupDetails(groupId);
      set({currentGroup: response.data, isLoading: false});
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch group details',
        isLoading: false,
      });
      throw error;
    }
  },

  createGroup: async groupData => {
    set({isLoading: true, error: null});
    try {
      const response = await groupsApi.createGroup(groupData);
      set(state => ({
        groups: [response.data, ...state.groups],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create group',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGroup: async (groupId, groupData) => {
    set({isLoading: true, error: null});
    try {
      const response = await groupsApi.updateGroup(groupId, groupData);
      set(state => ({
        groups: state.groups.map(g => (g.id === groupId ? response.data : g)),
        currentGroup: state.currentGroup?.id === groupId ? response.data : state.currentGroup,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update group',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGroup: async groupId => {
    set({isLoading: true, error: null});
    try {
      await groupsApi.deleteGroup(groupId);
      set(state => ({
        groups: state.groups.filter(g => g.id !== groupId),
        currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete group',
        isLoading: false,
      });
      throw error;
    }
  },

  addMember: async (groupId, userId) => {
    set({isLoading: true, error: null});
    try {
      const response = await groupsApi.addMember(groupId, userId);
      set(state => ({
        currentGroup: state.currentGroup?.id === groupId
          ? {...state.currentGroup, members: [...state.currentGroup.members, response.data]}
          : state.currentGroup,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add member',
        isLoading: false,
      });
      throw error;
    }
  },

  removeMember: async (groupId, userId) => {
    set({isLoading: true, error: null});
    try {
      await groupsApi.removeMember(groupId, userId);
      set(state => ({
        currentGroup: state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              members: state.currentGroup.members.filter(m => m.id !== userId),
            }
          : state.currentGroup,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to remove member',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchGroupExpenses: async groupId => {
    try {
      const response = await groupsApi.getGroupExpenses(groupId);
      set({groupExpenses: response.data});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch group expenses:', error);
    }
  },

  clearCurrentGroup: () => set({currentGroup: null}),
  clearError: () => set({error: null}),
}));