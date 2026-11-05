import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storefrontApi } from '../../services/storefrontApi';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A – Z' },
];

const STOCK_OPTIONS = [
  { value: 'in', label: 'In stock' },
  { value: 'out', label: 'Out of stock' },
];

// Each filter is stored in the URL as a comma list, e.g. ?category=1,4&brand=2&stock=in
const MATCHERS = {
  category: (p, values) => values.includes(String(p.categoryId)),
  brand: (p, values) => values.includes(String(p.brandId)),
  stock: (p, values) => values.includes(p.stock > 0 ? 'in' : 'out'),
};

const SORTERS = {
  newest: (a, b) => b.id - a.id,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

function readList(params, key) {
  return (params.get(key) || '').split(',').filter(Boolean);
}

function matchesSearch(p, term) {
  if (!term) return true;
  return [p.name, p.sku, p.brandName, p.categoryName].some((v) => v?.toLowerCase().includes(term));
}

// Apply every active filter except `skipKey` (used to count options within one facet)
function applyFilters(products, filters, skipKey) {
  return products.filter((p) =>
    Object.entries(filters).every(
      ([key, values]) => key === skipKey || !values.length || MATCHERS[key](p, values)
    )
  );
}

function buildOptions(products, idKey, labelKey) {
  const map = new Map();
  products.forEach((p) => {
    if (p[idKey] != null) map.set(String(p[idKey]), p[labelKey] || `#${p[idKey]}`);
  });
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Loads the full active catalogue once and filters / sorts it client-side from the URL query.
 */
export function useProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    storefrontApi
      .getProducts()
      .then((list) => {
        if (!cancelled) setAllProducts(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const search = searchParams.get('q') || '';
  const sort = SORTERS[searchParams.get('sort')] ? searchParams.get('sort') : 'newest';
  const filters = useMemo(
    () => ({
      category: readList(searchParams, 'category'),
      brand: readList(searchParams, 'brand'),
      stock: readList(searchParams, 'stock'),
    }),
    [searchParams]
  );

  const searched = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allProducts.filter((p) => matchesSearch(p, term));
  }, [allProducts, search]);

  const products = useMemo(
    () => [...applyFilters(searched, filters)].sort(SORTERS[sort]),
    [searched, filters, sort]
  );

  const facets = useMemo(() => {
    const withCounts = (key, options) => {
      const pool = applyFilters(searched, filters, key);
      return options.map((o) => ({
        ...o,
        count: pool.filter((p) => MATCHERS[key](p, [o.value])).length,
        checked: filters[key].includes(o.value),
      }));
    };
    return [
      { key: 'category', title: 'Category', options: withCounts('category', buildOptions(searched, 'categoryId', 'categoryName')) },
      { key: 'brand', title: 'Brand', options: withCounts('brand', buildOptions(searched, 'brandId', 'brandName')) },
      { key: 'stock', title: 'Availability', options: withCounts('stock', STOCK_OPTIONS) },
    ];
  }, [searched, filters]);

  const updateParams = useCallback(
    (mutate) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const toggleFilter = useCallback(
    (key, value) =>
      updateParams((next) => {
        const current = readList(next, key);
        const list = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        if (list.length) next.set(key, list.join(','));
        else next.delete(key);
      }),
    [updateParams]
  );

  const setSort = useCallback(
    (value) =>
      updateParams((next) => {
        if (value === 'newest') next.delete('sort');
        else next.set('sort', value);
      }),
    [updateParams]
  );

  const clearSearch = useCallback(() => updateParams((next) => next.delete('q')), [updateParams]);

  const clearAll = useCallback(
    () =>
      updateParams((next) => {
        ['q', 'category', 'brand', 'stock'].forEach((k) => next.delete(k));
      }),
    [updateParams]
  );

  // Selected options as removable chips
  const activeFilters = facets.flatMap((f) =>
    f.options.filter((o) => o.checked).map((o) => ({ key: f.key, value: o.value, label: o.label }))
  );

  return {
    products,
    facets,
    activeFilters,
    search,
    sort,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
    toggleFilter,
    setSort,
    clearSearch,
    clearAll,
  };
}

export default useProductListing;
