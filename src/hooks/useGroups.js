import {useCallback} from 'react';
import {useGroupsStore} from '../store/groupsStore';

export const useGroups = () => {
  const {
    groups,
    currentGroup,
    groupExpenses,
    isLoading,
    error,
    fetchGroups,
    fetchGroupDetails,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    fetchGroupExpenses,
    clearCurrentGroup,
    clearError,
  } = useGroupsStore();

  const handleCreateGroup = useCallback(async groupData => {
    try {
      const result = await createGroup(groupData);
      return {success: true, data: result};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [createGroup]);

  const handleUpdateGroup = useCallback(async (groupId, groupData) => {
    try {
      const result = await updateGroup(groupId, groupData);
      return {success: true, data: result};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [updateGroup]);

  const handleDeleteGroup = useCallback(async groupId => {
    try {
      await deleteGroup(groupId);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [deleteGroup]);

  return {
    groups,
    currentGroup,
    groupExpenses,
    isLoading,
    error,
    fetchGroups,
    fetchGroupDetails,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    addMember,
    removeMember,
    fetchGroupExpenses,
    clearCurrentGroup,
    clearError,
  };
};