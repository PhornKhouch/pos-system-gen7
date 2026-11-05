import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import { useCustomerStore } from '../store/useCustomerStore';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { SectionTitle } from '../../components/SectionTitle';
import { STORE_ROUTES } from '../../storeConfig';
import '../customer.css';

export function AccountPage() {
  const customer = useCustomerStore((s) => s.customer);
  const setCustomer = useCustomerStore((s) => s.setCustomer);
  const { logout } = useCustomerAuth();

  // Refresh profile (loyalty points etc.) from the server
  useEffect(() => {
    customerApi.getMe().then((res) => res?.data && setCustomer(res.data)).catch(() => {});
  }, [setCustomer]);

  if (!customer) return null;

  const rows = [
    ['Name', customer.customer_name],
    ['Email', customer.email],
    ['Phone', customer.phone],
    ['Loyalty points', String(customer.loyalty_points ?? 0)],
  ].filter(([, value]) => value);

  return (
    <div className="cust-account">
      <SectionTitle title={`Hi, ${customer.customer_name}`} />
      <div className="cust-account-card">
        {rows.map(([label, value]) => (
          <div key={label} className="pd-spec-row">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="cust-account-actions">
        <Link to={STORE_ROUTES.CART} className="store-btn store-btn-primary">
          View cart
        </Link>
        <button type="button" className="store-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
