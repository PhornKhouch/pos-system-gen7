import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { STORE_BRAND, STORE_ROUTES, HEADER_NAV, shopUrl } from '../storeConfig';
import { useCustomerStore } from '../customer/store/useCustomerStore';

export function StoreHeader() {
  const navigate = useNavigate();
  const customer = useCustomerStore((s) => s.customer);
  const cartCount = useCustomerStore((s) => s.cart.total_quantity);
  const firstName = customer?.customer_name?.split(' ')[0];
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentQuery);

  // Keep the input in sync when the URL changes (e.g. "Clear" on the results section)
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(shopUrl({ q: query.trim() }));
  };

  return (
    <header className="store-header">
      <div className="store-container store-header-inner">
        <Link to={STORE_ROUTES.HOME} className="store-logo">
          <span className="store-logo-mark">{STORE_BRAND.initial}</span>
          <span className="store-logo-text">{STORE_BRAND.name}</span>
        </Link>

        <form className="store-search" onSubmit={handleSubmit} role="search">
          <Search size={16} className="store-search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
          />
        </form>

        <nav className="store-nav">
          {HEADER_NAV.map((item) => (
            <Link key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="store-header-actions">
          <Link to={customer ? STORE_ROUTES.ACCOUNT : STORE_ROUTES.LOGIN} className="store-account-link">
            <User size={16} />
            <span>{customer ? firstName : 'Login'}</span>
          </Link>
          <Link to={STORE_ROUTES.CART} className="store-cart-button">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cartCount > 0 && <span className="store-cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default StoreHeader;
