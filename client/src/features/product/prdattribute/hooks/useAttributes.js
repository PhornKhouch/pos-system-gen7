import { useState, useEffect, useCallback } from 'react';
import { attributeApi } from '../services/attributeApi';

/**
 * Custom hook for Attribute management
 * Handles CRUD operations, loading states, and error handling
 */
export function useAttributes(filters = {}) {
  const [attributes, setAttributes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attributeApi.getAttributes(filters);
      if (response && response.success) {
        setAttributes(response.list || []);
        setTotal(response.total ?? (response.list ? response.list.length : 0));
      } else if (Array.isArray(response)) {
        setAttributes(response);
        setTotal(response.length);
      } else {
        setAttributes(response?.data?.list || response?.data || []);
        setTotal(response?.data?.total || 0);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch attributes';
      setError(errorMsg);
      setAttributes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  // Create Attribute
  const addAttribute = async (payload) => {
    setSubmitting(true);
    try {
      const res = await attributeApi.createAttribute(payload);
      await fetchAttributes();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Update Attribute
  const editAttribute = async (id, payload) => {
    setSubmitting(true);
    try {
      const res = await attributeApi.updateAttribute(id, payload);
      await fetchAttributes();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Attribute
  const removeAttribute = async (id) => {
    setSubmitting(true);
    try {
      const res = await attributeApi.deleteAttribute(id);
      await fetchAttributes();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    attributes,
    total,
    loading,
    submitting,
    error,
    refetch: fetchAttributes,
    addAttribute,
    editAttribute,
    removeAttribute,
  };
}

export default useAttributes;
