import { useState, useEffect } from 'react';
import { storefrontApi } from '../../services/storefrontApi';

const RELATED_LIMIT = 4;

/**
 * Loads one product (with its product_image gallery) plus a few products from the same category.
 */
export function useProductDetail(id) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);
    setRelated([]);

    storefrontApi
      .getProduct(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        if (!p) return;

        const list = await storefrontApi.getProducts({ category_id: p.categoryId });
        if (!cancelled) setRelated(list.filter((r) => r.id !== p.id).slice(0, RELATED_LIMIT));
      })
      .catch((err) => {
        if (!cancelled) setError(err.status === 404 ? null : err.message || 'Failed to load product');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return {
    product,
    related,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}

export default useProductDetail;
