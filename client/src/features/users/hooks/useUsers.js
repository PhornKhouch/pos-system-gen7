import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/userApi';

/**
 * Custom hook for User management
 * Handles CRUD operations, loading states, and error handling
 */
export function useUsers(filters = {}) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getUsers(filters);
      if (response && response.success) {
        setUsers(response.list || []);
        setTotal(response.total ?? (response.list ? response.list.length : 0));
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotal(response.length);
      } else if (response && response.data) {
        setUsers(response.data.list || response.data || []);
        setTotal(response.data.total || (Array.isArray(response.data) ? response.data.length : 0));
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch users';
      setError(errorMsg);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create User
  const addUser = async (userData) => {
    setSubmitting(true);
    try {
      const res = await userApi.createUser(userData);
      await fetchUsers();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Update User
  const editUser = async (id, userData) => {
    setSubmitting(true);
    try {
      const res = await userApi.updateUser(id, userData);
      await fetchUsers();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const removeUser = async (id) => {
    setSubmitting(true);
    try {
      const res = await userApi.deleteUser(id);
      await fetchUsers();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    users,
    total,
    loading,
    submitting,
    error,
    refetch: fetchUsers,
    addUser,
    editUser,
    removeUser,
  };
}

export default useUsers;
