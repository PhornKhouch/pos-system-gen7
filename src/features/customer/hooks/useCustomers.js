import { useState, useEffect, useCallback } from 'react';
import { customerApi } from '../services/customerApi';

/**
 * Custom hook for Customer listing (read-only)
 */
export function useCustomers(filters = {}) {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomers(filters);
      const list = response?.list || [];
      setCustomers(list);
      setTotal(response?.total ?? list.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    total,
    loading,
    error,
    refetch: fetchCustomers,
  };
}

export default useCustomers;
