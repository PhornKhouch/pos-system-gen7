import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { CreditCard, Minus, Plus, Trash2 } from 'lucide-react';
import { getAssetUrl } from '@/utils/imageUtils';
import { SectionTitle } from '../../components/SectionTitle';
import { useCart } from '../hooks/useCart';
import { customerApi } from '../services/customerApi';
import { STORE_ROUTES, formatPrice } from '../../storeConfig';
import '../customer.css';

function CartRow({ item, onQuantity, onRemove }) {
  const p = item.product || {};
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = p.image && !imageFailed ? getAssetUrl(p.image) : null;
  const unavailable = !p.product_id || p.active !== 1;

  return (
    <div className="cart-row">
      <Link to={STORE_ROUTES.product(item.product_id)} className="cart-thumb">
        {imageUrl ? (
          <img src={imageUrl} alt={p.product_name} onError={() => setImageFailed(true)} />
        ) : (
          <span>{(p.sku || 'PRD').slice(0, 3).toUpperCase()}</span>
        )}
      </Link>
      <div className="cart-row-info">
        <Link to={STORE_ROUTES.product(item.product_id)} className="cart-row-name">
          {p.product_name || `Product #${item.product_id}`}
        </Link>
        <div className="cart-row-sku">{p.sku}</div>
        {unavailable && <div className="cart-row-warn">No longer available</div>}
      </div>
      <div className="pd-qty cart-qty">
        <button
          type="button"
          onClick={() => onQuantity(item.product_id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          onClick={() => onQuantity(item.product_id, item.quantity + 1)}
          disabled={item.quantity >= (p.quantity_stock || 0)}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="cart-row-price">{formatPrice((parseFloat(p.price) || 0) * item.quantity)}</div>
      <button type="button" className="cart-remove" onClick={() => onRemove(item.product_id)} aria-label="Remove item">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function CartPage() {
  const { cart, loadCart, updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const cancelHandled = useRef(false);

  useEffect(() => {
    loadCart().finally(() => setLoading(false));
  }, [loadCart]);

  // Stripe sends the customer back here (?payment=cancelled&order_id=..) when they leave checkout
  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (searchParams.get('payment') !== 'cancelled' || !orderId || cancelHandled.current) return;
    cancelHandled.current = true;
    setSearchParams({}, { replace: true });

    customerApi
      .cancelCardPayment(orderId)
      .then((res) => {
        if (res?.status === 'PAID') message.success('This order was already paid.');
        else message.info('Payment cancelled. Your cart is still here.');
      })
      .catch(() => message.info('Payment cancelled.'));
  }, [searchParams, setSearchParams]);

  const handleCardCheckout = async () => {
    setPaying(true);
    try {
      const res = await customerApi.cardCheckout();
      if (!res?.data?.url) throw new Error('Could not start card payment');
      window.location.assign(res.data.url); // Stripe hosted checkout page
    } catch (err) {
      message.error(err.message || 'Could not start card payment');
      setPaying(false);
      loadCart(); // stock / price may have changed
    }
  };

  const hasUnavailable = cart.items.some((item) => !item.product?.product_id || item.product.active !== 1);

  if (loading && !cart.items.length) {
    return <div className="store-product-skeleton" style={{ height: 240 }} />;
  }

  if (!cart.items.length) {
    return (
      <div className="store-coming-soon">
        <h1>Your cart is empty</h1>
        <p>Find something you like and add it to your cart.</p>
        <Link to={STORE_ROUTES.SHOP} className="store-btn store-btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="listing-breadcrumb">
        <Link to={STORE_ROUTES.HOME}>Home</Link> / <span>Cart</span>
      </nav>
      <SectionTitle title={`Your cart (${cart.total_quantity})`} />

      <div className="cart-layout">
        <div className="cart-list">
          {cart.items.map((item) => (
            <CartRow key={item.cart_id} item={item} onQuantity={updateQuantity} onRemove={removeItem} />
          ))}
        </div>

        <aside className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <span>{cart.subtotal >= 50 ? 'Free' : 'Calculated at checkout'}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            className="store-btn store-btn-primary cust-submit"
            onClick={handleCardCheckout}
            disabled={paying || hasUnavailable}
            title={hasUnavailable ? 'Remove unavailable items first' : undefined}
          >
            <CreditCard size={16} />
            {paying ? 'Redirecting to payment…' : `Pay ${formatPrice(cart.subtotal)} with card`}
          </button>
          <div className="cart-pay-note">Visa · Mastercard — secure payment by Stripe</div>
          <Link to={STORE_ROUTES.SHOP} className="cart-continue">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
