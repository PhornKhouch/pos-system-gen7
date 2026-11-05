import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getAssetUrl } from '@/utils/imageUtils';

export function PosProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  // Format price with 2 decimal places e.g. $1099.00
  const formattedPrice = `$${(parseFloat(product.price) || 0).toFixed(2)}`;

  // Determine stock badge presentation
  let stockBadgeClass = 'normal';
  let stockBadgeText = `${product.stock} left`;

  if (isOutOfStock) {
    stockBadgeClass = 'out';
    stockBadgeText = 'OUT';
  } else if (isLowStock) {
    stockBadgeClass = 'low';
    stockBadgeText = `${product.stock} left`;
  }

  const handleClick = () => {
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  const imageUrl = product.image ? getAssetUrl(product.image) : null;

  return (
    <div
      className={`pos-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      onClick={handleClick}
      title={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
    >
      {/* Top Image / Placeholder Container */}
      <div className="pos-product-image-box">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="pos-product-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          style={{
            display: imageUrl ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <ImageIcon className="pos-placeholder-icon" size={32} />
        </div>

        {/* Stock Badge at Top Right */}
        <span className={`pos-stock-badge ${stockBadgeClass}`}>
          {stockBadgeText}
        </span>
      </div>

      {/* Product Content Details */}
      <div className="pos-product-content">
        <h4 className="pos-product-title" title={product.name}>
          {product.name}
        </h4>
        <div className="pos-product-footer">
          <span className="pos-product-price">{formattedPrice}</span>
          <span className="pos-product-sku">{product.sku}</span>
        </div>
      </div>
    </div>
  );
}

export default PosProductCard;
