import { useState, useEffect, useCallback } from 'react';
import { brandApi } from '../services/brandApi';

/**
 * Custom hook for Brand management
 * Handles CRUD operations, loading states, and error handling
 */
export function useBrands(filters = {}) {
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandApi.getBrands(filters);
      if (response && response.success) {
        setBrands(response.list || []);
        setTotal(response.total ?? (response.list ? response.list.length : 0));
      } else if (Array.isArray(response)) {
        setBrands(response);
        setTotal(response.length);
      } else {
        setBrands(response?.data?.list || response?.data || []);
        setTotal(response?.data?.total || 0);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch brands';
      setError(errorMsg);
      setBrands([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Create Brand
  const addBrand = async (payload) => {
    setSubmitting(true);
    try {
      const res = await brandApi.createBrand(payload);
      await fetchBrands();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Update Brand
  const editBrand = async (id, payload) => {
    setSubmitting(true);
    try {
      const res = await brandApi.updateBrand(id, payload);
      await fetchBrands();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Brand
  const removeBrand = async (id) => {
    setSubmitting(true);
    try {
      const res = await brandApi.deleteBrand(id);
      await fetchBrands();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    brands,
    total,
    loading,
    submitting,
    error,
    refetch: fetchBrands,
    addBrand,
    editBrand,
    removeBrand,
  };
}

export default useBrands;
