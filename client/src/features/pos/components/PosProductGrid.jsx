import React from 'react';
import { PackageOpen } from 'lucide-react';
import { PosProductCard } from './PosProductCard';

export function PosProductGrid({
  products = [],
  loading = false,
  onAddToCart,
}) {
  if (loading) {
    return (
      <main className="pos-catalog-area">
        <div className="pos-products-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="pos-product-card"
              style={{ opacity: 0.6, pointerEvents: 'none' }}
            >
              <div
                className="pos-product-image-box"
                style={{ background: '#f1f5f9' }}
              />
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    height: 14,
                    background: '#e2e8f0',
                    borderRadius: 4,
                    width: '70%',
                  }}
                />
                <div
                  style={{
                    height: 16,
                    background: '#e2e8f0',
                    borderRadius: 4,
                    width: '40%',
                    marginTop: 8,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="pos-catalog-area">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            color: '#94a3b8',
            gap: 12,
          }}
        >
          <PackageOpen size={48} strokeWidth={1.5} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>
            No products found matching your search.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pos-catalog-area">
      <div className="pos-products-grid">
        {products.map((product) => (
          <PosProductCard
            key={product.id || product.sku}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </main>
  );
}

export default PosProductGrid;
