import { useState, useEffect, useCallback } from 'react';
import { employeeApi } from '../services/employeeApi';

export function useEmployees(filters = {}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeApi.getEmployees(filters);
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = async (empData) => {
    const newEmp = await employeeApi.createEmployee(empData);
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  };

  const removeEmployee = async (id) => {
    await employeeApi.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    addEmployee,
    removeEmployee,
  };
}
