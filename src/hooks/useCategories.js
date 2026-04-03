import { useState, useEffect } from 'react';
import { categoriesApi } from '../api';

export const useCategories = (params) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async (p) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.getAll(p || params);
      setCategories(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [JSON.stringify(params)]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
  };
};

export default useCategories;
