import {useCallback, useEffect} from 'react';
import {useTransactionStore} from '../store/transactionStore';

export const useTransactions = (options = {}) => {
  const {autoFetch = true, type = null} = options;

  const {
    transactions,
    categories,
    currentTransaction,
    isLoading,
    error,
    pagination,
    filters,
    fetchTransactions,
    fetchCategories,
    createTransaction,
    setFilters,
    clearError,
  } = useTransactionStore();

  useEffect(() => {
    fetchCategories(type);
    if (autoFetch) {
      if (type) setFilters({type});
      fetchTransactions(true);
    }
  }, [autoFetch, type]);

  const loadMore = useCallback(() => {
    if (!isLoading && pagination.hasMore) {
      fetchTransactions();
    }
  }, [isLoading, pagination.hasMore, fetchTransactions]);

  const refresh = useCallback(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  const handleCreateTransaction = useCallback(async transactionData => {
    try {
      const result = await createTransaction(transactionData);
      return {success: true, data: result};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [createTransaction]);

  return {
    transactions,
    categories,
    currentTransaction,
    isLoading,
    error,
    pagination,
    filters,
    loadMore,
    refresh,
    fetchCategories,
    createTransaction: handleCreateTransaction,
    setFilters,
    clearError,
  };
};