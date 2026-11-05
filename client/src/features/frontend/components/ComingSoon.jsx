import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STORE_ROUTES } from '../storeConfig';

/** Placeholder for customer pages that are designed but not built yet (cart, stores, rewards…). */
export function ComingSoon() {
  const { pathname } = useLocation();
  const segment = pathname.split('/').filter(Boolean)[1] || 'page';
  const title = segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <div className="store-coming-soon">
      <h1>{title}</h1>
      <p>This page is on the way. In the meantime, browse what's in stock.</p>
      <Link to={STORE_ROUTES.HOME} className="store-btn store-btn-primary">
        Back to home
      </Link>
    </div>
  );
}

export default ComingSoon;
