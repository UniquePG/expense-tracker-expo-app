import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';

export const useTransactions = (params) => {
  const { 
    transactions, 
    isLoading, 
    error, 
    fetchTransactions, 
    fetchTransactionById, 
    createTransaction, 
    deleteTransaction 
  } = useTransactionStore();

  useEffect(() => {
    if (params) {
      fetchTransactions(params);
    }
  }, [JSON.stringify(params)]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    deleteTransaction,
  };
};

export default useTransactions;
