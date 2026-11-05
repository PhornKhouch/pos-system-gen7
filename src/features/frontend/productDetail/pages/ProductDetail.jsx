import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionTitle } from '../../components/SectionTitle';
import { StoreProductCard } from '../../components/StoreProductCard';
import { ProductGallery } from '../components/ProductGallery';
import { ProductInfo } from '../components/ProductInfo';
import { useProductDetail } from '../hooks/useProductDetail';
import { STORE_ROUTES, shopUrl } from '../../storeConfig';
import '../productDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const { product, related, loading, error, reload } = useProductDetail(id);

  if (loading) {
    return (
      <div className="pd-body">
        <div className="pd-gallery">
          <div className="pd-main-image store-product-skeleton" />
        </div>
        <div className="pd-info">
          <div className="store-product-skeleton" style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="listing-empty">
        <p>{error || 'This product is not available.'}</p>
        {error ? (
          <button type="button" className="store-btn" onClick={reload}>
            Try again
          </button>
        ) : (
          <Link to={STORE_ROUTES.SHOP} className="store-btn">
            Back to shop
          </Link>
        )}
      </div>
    );
  }

  const placeholder = (product.sku || product.name || 'PRD').slice(0, 3).toUpperCase();

  return (
    <div className="pd-page">
      <nav className="listing-breadcrumb">
        <Link to={STORE_ROUTES.HOME}>Home</Link>
        {' / '}
        {product.categoryName ? (
          <>
            <Link to={shopUrl({ category: product.categoryId })}>{product.categoryName}</Link>
            {' / '}
          </>
        ) : null}
        {product.brandName ? (
          <>
            <Link to={shopUrl({ brand: product.brandId })}>{product.brandName}</Link>
            {' / '}
          </>
        ) : null}
        <span>{product.name}</span>
      </nav>

      <div className="pd-body">
        <ProductGallery images={product.images} placeholder={placeholder} />
        <ProductInfo product={product} />
      </div>

      {related.length > 0 && (
        <div className="pd-related">
          <SectionTitle
            title={`More in ${product.categoryName || 'this category'}`}
            action={<Link to={shopUrl({ category: product.categoryId })}>View all</Link>}
          />
          <div className="pd-related-grid">
            {related.map((p) => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
