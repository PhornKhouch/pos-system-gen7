import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../services/categoryApi';

/**
 * Custom hook for Category management
 * Handles CRUD operations, loading states, and error handling
 */
export function useCategories(filters = {}) {
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getCategories(filters);
      if (response && response.success) {
        setCategories(response.list || []);
        setTotal(response.total ?? (response.list ? response.list.length : 0));
      } else if (Array.isArray(response)) {
        setCategories(response);
        setTotal(response.length);
      } else {
        setCategories(response?.data?.list || response?.data || []);
        setTotal(response?.data?.total || 0);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch categories';
      setError(errorMsg);
      setCategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create Category
  const addCategory = async (payload) => {
    setSubmitting(true);
    try {
      const res = await categoryApi.createCategory(payload);
      await fetchCategories();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Update Category
  const editCategory = async (id, payload) => {
    setSubmitting(true);
    try {
      const res = await categoryApi.updateCategory(id, payload);
      await fetchCategories();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const removeCategory = async (id) => {
    setSubmitting(true);
    try {
      const res = await categoryApi.deleteCategory(id);
      await fetchCategories();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    categories,
    total,
    loading,
    submitting,
    error,
    refetch: fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}

export default useCategories;
