import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Guard
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Feature Pages
import { Login } from '@/features/auth/pages/Login';
import { Register } from '@/features/auth/pages/Register';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { UserList } from '@/features/users/pages/UserList';
import { UserDetail } from '@/features/users/pages/UserDetail';
import { EmployeeList } from '@/features/employee/pages/EmployeeList';
import { EmployeeDetail } from '@/features/employee/pages/EmployeeDetail';
import { ProductManagement } from '@/features/product/pages/ProductManagement';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/products/categories" element={<Navigate to="/products?tab=categories" replace />} />
          <Route path="/employee" element={<EmployeeList />} />
          <Route path="/employee/:id" element={<EmployeeDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;

