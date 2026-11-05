import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { useCart } from '../hooks/useCart';
import { SectionTitle } from '../../components/SectionTitle';
import { STORE_ROUTES, formatPrice } from '../../storeConfig';
import '../customer.css';

/**
 * Stripe redirects here after card payment: /index/checkout/success?session_id=cs_...
 * The backend confirms the payment with Stripe and completes the order.
 */
export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { loadCart } = useCart();
  const [state, setState] = useState({ loading: true, order: null, error: null });
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    if (!sessionId) {
      setState({ loading: false, order: null, error: 'Missing payment session.' });
      return;
    }

    customerApi
      .verifyCardPayment(sessionId)
      .then((res) => {
        if (res?.status === 'COMPLETED') {
          setState({ loading: false, order: res.data, error: null });
          loadCart(); // paid items were removed from the cart
        } else {
          setState({ loading: false, order: res?.data || null, error: res?.message || 'Payment was not completed.' });
        }
      })
      .catch((err) => setState({ loading: false, order: null, error: err.message || 'Could not verify payment.' }));
  }, [sessionId, loadCart]);

  if (state.loading) {
    return (
      <div className="store-coming-soon">
        <h1>Confirming your payment…</h1>
        <p>Please don't close this page.</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="store-coming-soon">
        <XCircle size={44} className="checkout-icon fail" />
        <h1>Payment not completed</h1>
        <p>{state.error}</p>
        <Link to={STORE_ROUTES.CART} className="store-btn store-btn-primary">
          Back to cart
        </Link>
      </div>
    );
  }

  const { order } = state;
  const card = order.card_brand
    ? `${order.card_brand.toUpperCase()} •••• ${order.card_last4}`
    : 'Card';

  return (
    <div className="cust-account checkout-success">
      <div className="checkout-success-head">
        <CheckCircle2 size={44} className="checkout-icon ok" />
        <SectionTitle title="Thank you! Payment received" />
      </div>

      <div className="cust-account-card">
        {[
          ['Order no.', order.order_no],
          ['Invoice', order.invoice_number],
          ['Paid with', card],
          ['Paid at', order.paid_at ? new Date(order.paid_at).toLocaleString() : null],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="pd-spec-row">
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}

        <div className="checkout-items">
          {order.items.map((item) => (
            <div key={item.product_id} className="cart-summary-row">
              <span>
                {item.quantity} × {item.product_name || `Product #${item.product_id}`}
              </span>
              <span>{formatPrice(item.total_price)}</span>
            </div>
          ))}
          <div className="cart-summary-row total">
            <span>Total paid</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="cust-account-actions">
        <Link to={STORE_ROUTES.SHOP} className="store-btn store-btn-primary">
          Continue shopping
        </Link>
        <Link to={STORE_ROUTES.ACCOUNT} className="store-btn">
          My account
        </Link>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
