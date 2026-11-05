import React from 'react';
import { Plus, ShoppingCart, Trash2, PauseCircle } from 'lucide-react';

export function PosCartSidebar({
  cartItems = [],
  customer,
  subtotal,
  discountAmount,
  taxAmount,
  grandTotal,
  onUpdateQuantity,
  onClearCart,
  onOpenCustomerLookup,
  onOpenCheckout,
  onHoldOrder,
  onResetToMockup,
}) {
  // Format price helper
  const fmt = (val) => `$${(parseFloat(val) || 0).toFixed(2)}`;

  return (
    <aside className="pos-cart-sidebar">
      {/* 1. Customer Header */}
      <div className="pos-customer-header">
        <div className="pos-customer-left">
          <button
            className="pos-customer-plus-btn"
            onClick={onOpenCustomerLookup}
            title="Attach or change customer"
          >
            <Plus size={16} />
          </button>
          <div className="pos-customer-text">
            <span className="pos-customer-name">
              {customer?.name || 'Walk-in customer'}
            </span>
            <span
              className="pos-customer-sub"
              onClick={onOpenCustomerLookup}
              title="Click to attach loyalty"
            >
              {customer?.loyaltyTier && customer.id !== 'walk-in'
                ? `${customer.loyaltyTier} (${customer.loyaltyPoints} pts)`
                : 'Tap to attach loyalty'}
            </span>
          </div>
        </div>

        <button
          className="pos-customer-lookup-btn"
          onClick={onOpenCustomerLookup}
        >
          Lookup
        </button>
      </div>

      {/* 2. Cart Items List */}
      <div className="pos-cart-items">
        {cartItems.length === 0 ? (
          <div className="pos-cart-empty">
            <ShoppingCart size={40} strokeWidth={1.5} />
            <p>Cart is currently empty</p>
            <button
              onClick={onResetToMockup}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                fontSize: 12,
                color: '#2563eb',
                border: '1px solid #dbeafe',
                borderRadius: 6,
                background: '#eff6ff',
                cursor: 'pointer',
              }}
            >
              Restore Mockup Items
            </button>
          </div>
        ) : (
          cartItems.map((item) => {
            const lineTotal = item.price * item.quantity;
            const avatar =
              item.avatarCode ||
              (item.sku ? item.sku.substring(0, 3).toUpperCase() : 'PRD');

            return (
              <div key={item.sku} className="pos-cart-item">
                <div className="pos-cart-item-left">
                  <div className="pos-cart-item-avatar">{avatar}</div>
                  <div className="pos-cart-item-details">
                    <span className="pos-cart-item-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="pos-cart-item-meta">
                      {item.sku} · {fmt(item.price)}
                    </span>
                  </div>
                </div>

                <div className="pos-cart-item-actions">
                  {/* Stepper Controls */}
                  <div className="pos-cart-stepper">
                    <button
                      className="pos-stepper-btn"
                      onClick={() => onUpdateQuantity(item.sku, -1)}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="pos-stepper-value">{item.quantity}</span>
                    <button
                      className="pos-stepper-btn"
                      onClick={() => onUpdateQuantity(item.sku, 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="pos-cart-item-total">{fmt(lineTotal)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Cart Summary & Checkout */}
      <div className="pos-cart-summary">
        <div className="pos-summary-rows">
          <div className="pos-summary-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {fmt(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="pos-summary-row" style={{ color: '#16a34a' }}>
              <span>Loyalty Discount</span>
              <span>-{fmt(discountAmount)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="pos-summary-row">
              <span>Tax</span>
              <span>{fmt(taxAmount)}</span>
            </div>
          )}

          <div className="pos-summary-row total-row">
            <span>Total</span>
            <span className="pos-total-amount">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pos-cart-actions">
          <button
            className="pos-action-btn-secondary"
            onClick={onClearCart}
            disabled={cartItems.length === 0}
            title="Clear Cart"
          >
            <Trash2 size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Clear
          </button>

          <button
            className="pos-action-btn-secondary"
            onClick={onHoldOrder}
            disabled={cartItems.length === 0}
            title="Hold / Park current order"
          >
            <PauseCircle size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Hold
          </button>

          <button
            className="pos-pay-btn"
            onClick={onOpenCheckout}
            disabled={cartItems.length === 0}
          >
            Pay {fmt(grandTotal)}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default PosCartSidebar;
