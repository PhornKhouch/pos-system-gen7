import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Switch, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store/store';

const { Header: AntdHeader } = Layout;
const { Text } = Typography;

export function Navbar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <Text strong>{user?.name || 'User'}</Text>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntdHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--navbar-height)',
        lineHeight: 'var(--navbar-height)',
      }}
    >
      <Space size="middle">
        <Button
          type="text"
          icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: 16, width: 40, height: 40 }}
        />
        <Space align="center" size="small">
          <SafetyCertificateOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Text strong style={{ fontSize: 17, fontFamily: 'var(--font-heading)' }}>
            Clubcode<span style={{ color: '#1677ff' }}>POS</span>
          </Text>
        </Space>
      </Space>

      <Space size="middle">
        <Switch
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />

        {user && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : null}
              </Avatar>
              <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
                <Text strong style={{ fontSize: 13, display: 'block' }}>
                  {user.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {user.role}
                </Text>
              </div>
            </Space>
          </Dropdown>
        )}
      </Space>
    </AntdHeader>
  );
}

export default Navbar;
