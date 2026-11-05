import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerStore } from '../store/useCustomerStore';
import { STORE_ROUTES } from '../../storeConfig';

/** Storefront route guard: sends guests to the customer login and back afterwards. */
export function RequireCustomer() {
  const token = useCustomerStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={STORE_ROUTES.LOGIN} state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}

export default RequireCustomer;
