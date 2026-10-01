import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/userApi';

export function useUsers(filters = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUsers(filters);
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (userData) => {
    const newUser = await userApi.createUser(userData);
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const removeUser = async (id) => {
    await userApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    addUser,
    removeUser,
  };
}
