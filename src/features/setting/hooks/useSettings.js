import { useState, useEffect, useCallback } from 'react';
import { settingApi } from '../services/settingApi';

/**
 * Custom hook for General Setting management
 * Handles CRUD operations, loading states, and error handling
 */
export function useSettings(filters = {}) {
  const [settings, setSettings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingApi.getSettings(filters);
      setSettings(response?.list || []);
      setTotal(response?.total ?? response?.list?.length ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch settings');
      setSettings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const runAndRefresh = async (action) => {
    setSubmitting(true);
    try {
      const res = await action();
      await fetchSettings();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  const addSetting = (payload) => runAndRefresh(() => settingApi.createSetting(payload));
  const editSetting = (id, payload) => runAndRefresh(() => settingApi.updateSetting(id, payload));
  const removeSetting = (id) => runAndRefresh(() => settingApi.deleteSetting(id));

  return {
    settings,
    total,
    loading,
    submitting,
    error,
    refetch: fetchSettings,
    addSetting,
    editSetting,
    removeSetting,
  };
}

export default useSettings;
