import { create } from 'zustand';
import { groupsApi } from '../api';
import { useAuthStore } from './authStore';

const sameId = (left, right) => String(left) === String(right);

export const useGroupsStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupExpenses: [],
  groupBalances: [],
  groupAnalytics: null,
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchGroups: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getAll(params);
      set({ groups: response.data || [], isLoading: false });
      return response.data || [];
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroupDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getById(id);
      console.log("response ", response )
      set({
        currentGroup: response.data || null,
        groupMembers: response.data?.members || [],
        groupExpenses: response.data?.expenses || [],
        isLoading: false,
      });
      return response.data || null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroupMembers: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getMembers(id);
      set({ groupMembers: response.data || [], isLoading: false });
      return response.data || [];
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroupExpenses: async (id, params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getExpenses(id, params);
      set({ groupExpenses: response.data || [], isLoading: false });
      return response.data || [];
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroupBalances: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getBalances(id);
      set({ groupBalances: response.data || [], isLoading: false });
      return response.data || [];
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroupAnalytics: async (id) => {
    const expenses = get().groupExpenses.length
      ? get().groupExpenses
      : await get().fetchGroupExpenses(id);
    const balances = get().groupBalances.length
      ? get().groupBalances
      : await get().fetchGroupBalances(id);

    const categoryMap = new Map();
    const payerMap = new Map();

    expenses.forEach((expense) => {
      const categoryKey = expense.categoryName || 'General';
      const previousCategory = categoryMap.get(categoryKey) || {
        name: categoryKey,
        color: expense.categoryColor || '#00B4D8',
        amount: 0,
      };
      previousCategory.amount += Number(expense.amount || 0);
      categoryMap.set(categoryKey, previousCategory);

      const payerKey = expense.paidById || expense.paidByName || 'Unknown';
      const previousPayer = payerMap.get(payerKey) || {
        id: expense.paidById || payerKey,
        name: expense.paidByName || 'Unknown',
        amount: 0,
      };
      previousPayer.amount += Number(expense.amount || 0);
      payerMap.set(payerKey, previousPayer);
    });

    const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
    const topPayers = Array.from(payerMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const analytics = {
      totalSpend: expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      categoryBreakdown,
      topPayers,
      unsettledCount: balances.filter((item) => Number(item.balance || 0) !== 0).length,
    };

    set({ groupAnalytics: analytics });
    return analytics;
  },

  createGroup: async (data) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.create(data);
      set((state) => ({
        groups: [response.data, ...state.groups],
        isActionLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  addGroupMember: async (groupId, payload) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.addMember(groupId, payload);
      set((state) => ({
        groupMembers: [response.data, ...state.groupMembers],
        currentGroup: state.currentGroup
          ? {
              ...state.currentGroup,
              members: [response.data, ...(state.currentGroup.members || [])],
              memberCount: (state.currentGroup.memberCount || 0) + 1,
            }
          : state.currentGroup,
        isActionLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  addGroupMembers: async (groupId, members) => {
    const createdMembers = [];
    for (const memberPayload of members) {
      const created = await get().addGroupMember(groupId, memberPayload);
      createdMembers.push(created);
    }
    return createdMembers;
  },

  removeGroupMember: async (groupId, memberId) => {
    set({ isActionLoading: true, error: null });
    try {
      await groupsApi.removeMember(groupId, memberId);
      set((state) => ({
        groupMembers: state.groupMembers.filter(
          (member) =>
            !sameId(member.id, memberId) &&
            !sameId(member.userId, memberId) &&
            !sameId(member.contactId, memberId)
        ),
        currentGroup: state.currentGroup
          ? {
              ...state.currentGroup,
              members: (state.currentGroup.members || []).filter(
                (member) =>
                  !sameId(member.id, memberId) &&
                  !sameId(member.userId, memberId) &&
                  !sameId(member.contactId, memberId)
              ),
              memberCount: Math.max((state.currentGroup.memberCount || 1) - 1, 0),
            }
          : state.currentGroup,
        isActionLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  toggleGroupMemberAdmin: async (groupId, memberId, isAdmin) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.toggleMemberAdmin(groupId, memberId, isAdmin);
      set((state) => {
        const syncMember = (member) =>
          sameId(member.id, memberId) ? { ...member, isAdmin: response.data?.isAdmin ?? isAdmin } : member;
        return {
          groupMembers: state.groupMembers.map(syncMember),
          currentGroup: state.currentGroup
            ? {
                ...state.currentGroup,
                members: (state.currentGroup.members || []).map(syncMember),
              }
            : state.currentGroup,
          isActionLoading: false,
        };
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  updateGroup: async (groupId, payload) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.update(groupId, payload);
      set((state) => ({
        currentGroup:
          sameId(state.currentGroup?.id, groupId) ? response.data : state.currentGroup,
        groups: state.groups.map((group) => (sameId(group.id, groupId) ? response.data : group)),
        isActionLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  uploadGroupImage: async (groupId, imageFile) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || `group_${Date.now()}.jpg`,
    });

    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.uploadImage(groupId, formData);
      set((state) => ({
        currentGroup: sameId(state.currentGroup?.id, groupId) ? response.data : state.currentGroup,
        groups: state.groups.map((group) => (sameId(group.id, groupId) ? response.data : group)),
        isActionLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  deleteGroupImage: async (groupId) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.deleteImage(groupId);
      set((state) => ({
        currentGroup: sameId(state.currentGroup?.id, groupId) ? response.data : state.currentGroup,
        groups: state.groups.map((group) => (sameId(group.id, groupId) ? response.data : group)),
        isActionLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  settleGroup: async (groupId) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await groupsApi.settle(groupId);
      set({ isActionLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  archiveGroup: async (groupId, isArchived) => {
    const status = isArchived ? 'ARCHIVED' : 'ACTIVE';
    return get().updateGroup(groupId, { status });
  },

  leaveGroup: async (groupId, userIdOverride) => {
    const authState = useAuthStore.getState();
    const userId = userIdOverride || authState?.user?.id;
    if (!userId) {
      throw new Error('Unable to resolve current user for leave group action');
    }
    await get().removeGroupMember(groupId, userId);
    set((state) => ({
      groups: state.groups.filter((group) => !sameId(group.id, groupId)),
      currentGroup: sameId(state.currentGroup?.id, groupId) ? null : state.currentGroup,
    }));
    return true;
  },

  deleteGroup: async (groupId) => {
    set({ isActionLoading: true, error: null });
    try {
      await groupsApi.delete(groupId);
      set((state) => ({
        groups: state.groups.filter((group) => !sameId(group.id, groupId)),
        currentGroup: sameId(state.currentGroup?.id, groupId) ? null : state.currentGroup,
        isActionLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      throw error;
    }
  },

  clearCurrentGroup: () =>
    set({
      currentGroup: null,
      groupMembers: [],
      groupExpenses: [],
      groupBalances: [],
      groupAnalytics: null,
    }),

  setGroups: (groups) => set({ groups }),
}));

export default useGroupsStore;
