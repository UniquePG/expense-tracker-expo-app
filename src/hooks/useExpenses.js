import {useCallback, useEffect} from 'react';
import {useExpenseStore} from '../store/expenseStore';

export const useExpenses = (options = {}) => {
  const {
    autoFetch = false,
    friendId = null,
    groupId = null,
  } = options;

  const {
    expenses,
    currentExpense,
    isLoading,
    isCreating,
    error,
    pagination,
    filters,
    fetchExpenses,
    fetchExpenseDetails,
    createExpense,
    updateExpense,
    deleteExpense,
    updateSplit,
    uploadReceipt,
    setFilters,
    clearFilters,
    clearCurrentExpense,
    clearError,
  } = useExpenseStore();

  useEffect(() => {
    if (autoFetch) {
      if (friendId) {
        setFilters({friendId, groupId: null});
      } else if (groupId) {
        setFilters({groupId, friendId: null});
      }
      fetchExpenses(true);
    }
  }, [autoFetch, friendId, groupId]);

  const loadMore = useCallback(() => {
    if (!isLoading && pagination.hasMore) {
      fetchExpenses();
    }
  }, [isLoading, pagination.hasMore, fetchExpenses]);

  const refresh = useCallback(() => {
    fetchExpenses(true);
  }, [fetchExpenses]);

  const handleCreateExpense = useCallback(async expenseData => {
    try {
      const result = await createExpense(expenseData);
      return {success: true, data: result};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [createExpense]);

  const handleUpdateSplit = useCallback(async (expenseId, splitData) => {
    try {
      const result = await updateSplit(expenseId, splitData);
      return {success: true, data: result};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [updateSplit]);

  return {
    expenses,
    currentExpense,
    isLoading,
    isCreating,
    error,
    pagination,
    filters,
    loadMore,
    refresh,
    fetchExpenseDetails,
    createExpense: handleCreateExpense,
    updateExpense,
    deleteExpense,
    updateSplit: handleUpdateSplit,
    uploadReceipt,
    setFilters,
    clearFilters,
    clearCurrentExpense,
    clearError,
  };
};