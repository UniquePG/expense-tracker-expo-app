import { useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';

export const useExpenses = (params) => {
  const { 
    expenses, 
    summary, 
    isLoading, 
    error, 
    fetchExpenses, 
    fetchExpenseById, 
    fetchSummary, 
    createExpense, 
    deleteExpense 
  } = useExpenseStore();

  useEffect(() => {
    if (params) {
      fetchExpenses(params);
    }
  }, [JSON.stringify(params)]);

  return {
    expenses,
    summary,
    isLoading,
    error,
    fetchExpenses,
    fetchExpenseById,
    fetchSummary,
    createExpense,
    deleteExpense,
  };
};

export default useExpenses;
