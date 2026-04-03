import { useEffect } from 'react';
import { useGroupsStore } from '../store/groupsStore';

export const useGroups = (params) => {
  const {
    groups,
    currentGroup,
    groupMembers,
    groupExpenses,
    groupBalances,
    groupAnalytics,
    isLoading,
    isActionLoading,
    error,
    fetchGroups,
    fetchGroupDetails,
    fetchGroupMembers,
    fetchGroupExpenses,
    fetchGroupBalances,
    fetchGroupAnalytics,
    createGroup,
    addGroupMember,
    addGroupMembers,
    removeGroupMember,
    toggleGroupMemberAdmin,
    updateGroup,
    uploadGroupImage,
    deleteGroupImage,
    settleGroup,
    archiveGroup,
    leaveGroup,
    deleteGroup,
    clearCurrentGroup,
  } = useGroupsStore();

  useEffect(() => {
    if (params !== undefined) {
      fetchGroups(params);
    }
  }, [fetchGroups, JSON.stringify(params)]);

  return {
    groups,
    groupDetails: currentGroup,
    currentGroup,
    groupMembers,
    groupExpenses,
    groupBalances,
    groupAnalytics,
    isLoading,
    isActionLoading,
    error,
    fetchGroups,
    getGroupDetails: fetchGroupDetails,
    fetchGroupDetails,
    fetchGroupMembers,
    fetchGroupExpenses,
    fetchGroupBalances,
    fetchGroupAnalytics,
    createGroup,
    addGroupMember,
    addGroupMembers,
    removeGroupMember,
    toggleGroupMemberAdmin,
    updateGroup,
    uploadGroupImage,
    deleteGroupImage,
    settleGroup,
    archiveGroup,
    leaveGroup,
    deleteGroup,
    clearCurrentGroup,
  };
};

export default useGroups;
