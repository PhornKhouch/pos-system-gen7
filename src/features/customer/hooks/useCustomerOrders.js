import { useState, useEffect, useCallback, useMemo } from 'react';
import { customerApi } from '../services/customerApi';

/**
 * Custom hook for Customer Orders listing & statistics
 */
export function useCustomerOrders(filters = {}) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomerOrders(filters);
      const list = response?.list || [];
      setOrders(list);
      setTotal(response?.total ?? list.length);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch customer orders');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let totalItems = 0;

    orders.forEach((order) => {
      const amount = Number(order.total_amount) || 0;
      const status = (order.status || '').toLowerCase();
      if (status === 'completed') {
        completedCount += 1;
        totalRevenue += amount;
      } else if (status === 'pending') {
        pendingCount += 1;
      } else if (status === 'cancelled') {
        cancelledCount += 1;
      }
      totalItems += Number(order.total_quantity) || 0;
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      completedCount,
      pendingCount,
      cancelledCount,
      totalItems,
    };
  }, [orders]);

  return {
    orders,
    total,
    loading,
    error,
    stats,
    refetch: fetchOrders,
  };
}

export default useCustomerOrders;

