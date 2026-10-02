import React from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  InboxOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store/store';

const { Sider } = Layout;

export function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');

  // Compute selected menu key
  let selectedKey = location.pathname;
  if (location.pathname === '/products') {
    if (tab === 'categories') {
      selectedKey = '/products?tab=categories';
    } else {
      selectedKey = '/products';
    }
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: 'inventory',
      icon: <ShopOutlined />,
      label: 'Inventory',
      children: [
        {
          key: '/products',
          icon: <InboxOutlined />,
          label: 'Product Catalog',
        },
        {
          key: '/products?tab=categories',
          icon: <AppstoreOutlined />,
          label: 'Categories',
        },
      ],
    },
    {
      key: '/employee',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={!isSidebarOpen}
      width={240}
      collapsedWidth={80}
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        minHeight: 'calc(100vh - var(--navbar-height))',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['inventory']}
        items={menuItems}
        onClick={({ key }) => {
          if (key.startsWith('/')) {
            navigate(key);
          }
        }}
        style={{
          borderRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          background: 'transparent',
        }}
      />
    </Sider>
  );
}

export default Sidebar;
