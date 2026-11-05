import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useCart } from '../customer/hooks/useCart';
import '../customer/customer.css';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { StoreTabBar } from './StoreTabBar';
import { ANNOUNCEMENT } from '../storeConfig';
import './store.css';

/**
 * Public shell for the customer site: announcement bar, header, page content, footer.
 * On small screens the header nav is replaced by a bottom tab bar.
 */
export function StoreLayout() {
  const { isLoggedIn, loadCart } = useCart();

  // Cart badge in the header: load the logged-in customer's cart once per session
  useEffect(() => {
    if (isLoggedIn) loadCart();
  }, [isLoggedIn, loadCart]);

  return (
    <div className="store-root">
      <div className="store-announcement">{ANNOUNCEMENT}</div>
      <StoreHeader />
      <main className="store-main">
        <div className="store-container">
          <Outlet />
        </div>
      </main>
      <StoreFooter />
      <StoreTabBar />
    </div>
  );
}

export default StoreLayout;
