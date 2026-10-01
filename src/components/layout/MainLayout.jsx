import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const { Content } = Layout;

export function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Sidebar />
        <Content
          style={{
            padding: 24,
            margin: 0,
            background: 'var(--bg-app)',
            minHeight: 'calc(100vh - var(--navbar-height))',
            overflowY: 'auto',
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
