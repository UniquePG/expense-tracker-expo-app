import { useEffect } from 'react';
import { useSettlementStore } from '../store/settlementStore';

export const useSettlements = (params) => {
  const { settlements, isLoading, error, fetchSettlements, createSettlement, confirmSettlement } = useSettlementStore();

  useEffect(() => {
    fetchSettlements(params);
  }, [JSON.stringify(params)]);

  return {
    settlements,
    isLoading,
    error,
    fetchSettlements,
    createSettlement,
    confirmSettlement,
  };
};

export default useSettlements;
