import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Heart } from 'lucide-react';
import { formatPrice, STORE_ROUTES } from '../../storeConfig';
import { useCart } from '../../customer/hooks/useCart';

function stockInfo(stock) {
  if (stock <= 0) return { title: 'Out of stock', note: 'Check back soon or ask at a branch', tone: 'out' };
  if (stock <= 3) return { title: `Only ${stock} left`, note: 'Ships today if ordered before 4pm', tone: 'low' };
  return { title: `In stock — ${stock} units`, note: 'Ships today if ordered before 4pm', tone: 'in' };
}

export function ProductInfo({ product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const stock = stockInfo(product.stock);
  const soldOut = product.stock <= 0;

  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [product.id]);

  const changeQty = (delta) => {
    setAdded(false);
    setQty((q) => Math.min(Math.max(1, q + delta), Math.max(1, product.stock)));
  };

  // Logged-in customer -> saved to their cart; guest -> redirected to login (item is added after login)
  const handleAddToCart = async () => {
    setAdding(true);
    const ok = await addToCart(product, qty);
    setAdding(false);
    setAdded(ok);
  };

  const specs = [
    ['Brand', product.brandName],
    ['Category', product.categoryName],
    [product.attributeName, product.attributeValue],
    ['SKU', product.sku],
    ['Barcode', product.barcode],
  ].filter(([label, value]) => label && value);

  return (
    <div className="pd-info">
      <div>
        <div className="pd-eyebrow">
          {[product.brandName, product.sku].filter(Boolean).join(' · ').toUpperCase()}
        </div>
        <h1 className="pd-title">{product.name}</h1>
      </div>

      <div className="pd-price">{formatPrice(product.price)}</div>

      <div className="pd-stock-box">
        <div className="pd-stock-row">
          <span className={`pd-dot ${stock.tone}`} />
          <div>
            <div className="pd-stock-title">{stock.title}</div>
            <div className="pd-stock-note">{stock.note}</div>
          </div>
        </div>
        <div className="pd-stock-row">
          <span className="pd-dot" />
          <div>
            <div className="pd-stock-title">Pickup at Main branch</div>
            <div className="pd-stock-note">Ready in ~30 minutes</div>
          </div>
        </div>
        <div className="pd-stock-row">
          <span className="pd-dot" />
          <div>
            <div className="pd-stock-title">Free delivery</div>
            <div className="pd-stock-note">Phnom Penh, orders over $50</div>
          </div>
        </div>
      </div>

      <div className="pd-actions">
        <div className="pd-qty">
          <button type="button" onClick={() => changeQty(-1)} disabled={soldOut || qty <= 1} aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => changeQty(1)} disabled={soldOut || qty >= product.stock} aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
        <button type="button" className="store-btn store-btn-primary pd-add" disabled={soldOut || adding} onClick={handleAddToCart}>
          {soldOut ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
        </button>
        <button type="button" className="store-btn pd-wish" aria-label="Add to wishlist">
          <Heart size={18} />
        </button>
      </div>

      {added && (
        <div className="pd-added">
          Added {qty} × {product.name} to your cart. <Link to={STORE_ROUTES.CART}>View cart</Link>
        </div>
      )}

      <div className="pd-pay-note">
        Pay with KHQR, ABA Pay, Wing, card or cash on delivery
      </div>

      {product.description && (
        <div className="pd-section">
          <div className="pd-section-title">Description</div>
          <p className="pd-description">{product.description}</p>
        </div>
      )}

      {specs.length > 0 && (
        <div className="pd-section">
          <div className="pd-section-title">Specifications</div>
          <div className="pd-specs">
            {specs.map(([label, value]) => (
              <div key={label} className="pd-spec-row">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
