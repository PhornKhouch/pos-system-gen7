import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '@/utils/imageUtils';
import { STORE_ROUTES, formatPrice } from '../storeConfig';

function stockLabel(stock) {
  if (stock <= 0) return { text: 'Out of stock', tone: 'out' };
  if (stock <= 3) return { text: `Only ${stock} left`, tone: 'low' };
  return { text: 'In stock · pickup today', tone: 'in' };
}

export function StoreProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = product.image && !imageFailed ? getAssetUrl(product.image) : null;
  const stock = stockLabel(product.stock);
  const placeholder = (product.sku || product.name || 'PRD').slice(0, 3).toUpperCase();

  return (
    <Link to={STORE_ROUTES.product(product.id)} className="store-product-card">
      <div className="store-product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} onError={() => setImageFailed(true)} />
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      {product.brandName ? <div className="store-product-brand">{product.brandName}</div> : null}
      <div className="store-product-name">{product.name}</div>
      <div className="store-product-price">{formatPrice(product.price)}</div>
      <div className={`store-product-stock ${stock.tone}`}>{stock.text}</div>
    </Link>
  );
}

export default StoreProductCard;
