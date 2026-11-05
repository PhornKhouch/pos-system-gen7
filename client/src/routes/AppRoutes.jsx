import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Guard
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Feature Pages
import { Login } from '@/features/auth/pages/Login';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { UserList } from '@/features/users/pages/UserList';
import { UserDetail } from '@/features/users/pages/UserDetail';
import { CustomerList, CustomerOrdersPage } from '@/features/customer';
import { EmployeeList } from '@/features/employee/pages/EmployeeList';
import { EmployeeDetail } from '@/features/employee/pages/EmployeeDetail';
import { ProductManagement } from '@/features/product/pages/ProductManagement';
import { GeneralSetting } from '@/features/setting';
import { PosScreen, Sale } from '@/features/pos';
import {
  StoreLayout,
  HomePage,
  ProductListing,
  ProductDetail,
  ComingSoon,
  CustomerLogin,
  CustomerRegister,
  ForgotPassword,
  GoogleCallback,
  RequireCustomer,
  CartPage,
  CheckoutSuccess,
  AccountPage,
} from '@/features/frontend';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/pos" element={<Sale />} />

      {/* Public customer site */}
      <Route path="/index" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ProductListing />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="login" element={<CustomerLogin />} />
        <Route path="register" element={<CustomerRegister />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="google-callback" element={<GoogleCallback />} />
        {/* Customer must be logged in */}
        <Route element={<RequireCustomer />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customer-orders" element={<CustomerOrdersPage />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/products/categories" element={<Navigate to="/products?tab=categories" replace />} />
          <Route path="/employee" element={<EmployeeList />} />
          <Route path="/employee/:id" element={<EmployeeDetail />} />
          <Route path="/settings" element={<GeneralSetting />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
