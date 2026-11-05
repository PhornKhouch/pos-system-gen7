import React from 'react';
import { SectionTitle } from '../../components/SectionTitle';
import { StoreProductCard } from '../../components/StoreProductCard';

export function ProductSection({ id, title, action, products, loading, error, onRetry, emptyText }) {
  let content;

  if (loading) {
    content = (
      <div className="home-product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="store-product-skeleton" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="home-empty">
        <p>{error}</p>
        <button type="button" className="store-btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  } else if (!products.length) {
    content = (
      <div className="home-empty">
        <p>{emptyText}</p>
      </div>
    );
  } else {
    content = (
      <div className="home-product-grid">
        {products.map((p) => (
          <StoreProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <section id={id} className="home-section">
      <SectionTitle title={title} action={action} />
      {content}
    </section>
  );
}

export default ProductSection;
