import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tag, ShoppingCart, Gift, User } from 'lucide-react';
import { STORE_ROUTES } from '../storeConfig';
import { useCustomerStore } from '../customer/store/useCustomerStore';

const TABS = [
  { label: 'Home', to: STORE_ROUTES.HOME, icon: Home, end: true },
  { label: 'Shop', to: STORE_ROUTES.SHOP, icon: Tag },
  { label: 'Cart', to: STORE_ROUTES.CART, icon: ShoppingCart },
  { label: 'Rewards', to: STORE_ROUTES.REWARDS, icon: Gift },
  { label: 'Account', to: STORE_ROUTES.ACCOUNT, icon: User },
];

/** Bottom navigation, only visible on mobile widths (see store.css). */
export function StoreTabBar() {
  const cartCount = useCustomerStore((s) => s.cart.total_quantity);

  return (
    <nav className="store-tabbar">
      {TABS.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) => `store-tab ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
          {to === STORE_ROUTES.CART && cartCount > 0 && <span className="store-cart-count">{cartCount}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default StoreTabBar;
