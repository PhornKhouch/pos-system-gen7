import { useState, useEffect, useMemo, useCallback } from 'react';
import { posApi } from '../services/posApi';
import { INITIAL_CATEGORIES } from '../services/mockData';

export function usePosProducts() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        posApi.getCategories(),
        posApi.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err.message || 'Failed to load POS catalogue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter products based on selected category & search query
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      // 1. Search Query Filter (name, sku, barcode)
      if (query) {
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesSku = product.sku?.toLowerCase().includes(query);
        const matchesBarcode = product.barcode && product.barcode.includes(query);
        if (!matchesName && !matchesSku && !matchesBarcode) {
          return false;
        }
      }

      // 2. Category Filter (If search is active, show across all categories)
      if (query) return true;

      if (selectedCategory === 'all' || selectedCategory === 'popular') {
        return true; // Show all products
      }

      // Match by category_id or categoryName
      const matchesId =
        product.category_id !== undefined &&
        String(product.category_id) === String(selectedCategory);

      const matchesName =
        product.categoryName &&
        product.categoryName.toLowerCase() === String(selectedCategory).toLowerCase();

      return matchesId || matchesName;
    });
  }, [products, selectedCategory, searchQuery]);

  // Find product by exact barcode match
  const findProductByBarcode = useCallback(
    (barcode) => {
      if (!barcode) return null;
      const clean = barcode.trim().toLowerCase();
      return products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === clean) ||
          (p.sku && p.sku.toLowerCase() === clean)
      );
    },
    [products]
  );

  return {
    categories,
    products,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch: loadData,
    findProductByBarcode,
  };
}

export default usePosProducts;
