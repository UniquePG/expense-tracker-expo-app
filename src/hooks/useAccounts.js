import { useEffect } from 'react';
import { useAccountStore } from '../store/accountStore';

export const useAccounts = (params) => {
  const {
    accounts,
    totalBalance,
    isLoading,
    error,
    fetchAccounts,
    fetchAccountById,
    fetchTotalBalance,
    fetchAccountBalance,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccountStore();

  useEffect(() => {
    fetchAccounts(params);
  }, []);

  useEffect(() => {
    fetchTotalBalance();
  }, []);

  return {
    accounts,
    totalBalance,
    isLoading,
    error,
    fetchAccounts,
    fetchAccountById,
    fetchTotalBalance,
    fetchAccountBalance,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};

// export default useAccounts;
