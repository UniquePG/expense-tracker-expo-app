import { useEffect } from 'react';
import { useGroupsStore } from '../store/groupsStore';

export const useGroups = (params) => {
  const { groups, currentGroup, isLoading, error, fetchGroups, fetchGroupDetails, createGroup } = useGroupsStore();

  useEffect(() => {
    fetchGroups(params);
  }, [JSON.stringify(params)]);

  return {
    groups,
    currentGroup,
    isLoading,
    error,
    fetchGroups,
    fetchGroupDetails,
    createGroup,
  };
};

export default useGroups;
