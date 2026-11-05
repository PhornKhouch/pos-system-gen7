import { useState, useEffect, useCallback } from 'react';
import { productMasterApi } from '../services/productMasterApi';

/**
 * Custom hook for Product Master management
 * Handles CRUD operations, loading states, and error handling
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productMasterApi.getProducts(filters);
      if (response && response.success) {
        setProducts(response.list || []);
        setTotal(response.total ?? (response.list ? response.list.length : 0));
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotal(response.length);
      } else {
        setProducts(response?.data?.list || response?.data || []);
        setTotal(response?.data?.total || 0);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch products';
      setError(errorMsg);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Create Product
  const addProduct = async (payload) => {
    setSubmitting(true);
    try {
      const res = await productMasterApi.createProduct(payload);
      await fetchProducts();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Update Product
  const editProduct = async (id, payload) => {
    setSubmitting(true);
    try {
      const res = await productMasterApi.updateProduct(id, payload);
      await fetchProducts();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const removeProduct = async (id) => {
    setSubmitting(true);
    try {
      const res = await productMasterApi.deleteProduct(id);
      await fetchProducts();
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products,
    total,
    loading,
    submitting,
    error,
    refetch: fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
}

export default useProducts;
