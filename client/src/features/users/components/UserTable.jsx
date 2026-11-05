import React from 'react';
import { Table, Tag, Avatar, Space, Button, Popconfirm, Tooltip } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';
import { getAssetUrl } from '@/utils/imageUtils';

const ROLE_COLORS = {
  admin: 'purple',
  manager: 'volcano',
  supervisor: 'blue',
  cashier: 'orange',
  staff: 'green',
};

export function UserTable({ users, loading, onEdit, onDeleteUser }) {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 70,
      align: 'center',
      render: (id) => <span style={{ fontWeight: 600, color: '#8c8c8c' }}>#{id}</span>,
    },
    {
      title: 'User Profile',
      key: 'profile',
      render: (_, record) => {
        const displayName = record.full_name || record.username || 'User';
        const roleColor = ROLE_COLORS[record.role?.toLowerCase()] || '#1677ff';
        const avatarSrc = record.image
          ? getAssetUrl(
              record.image.startsWith('user_profile/')
                ? record.image
                : `user_profile/${record.image}`
            )
          : null;

        return (
          <Space size="middle">
            {avatarSrc ? (
              <Avatar
                size={40}
                src={avatarSrc}
                style={{
                  border: '1px solid #d9d9d9',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Avatar size={40} style={{ backgroundColor: roleColor }} icon={<UserOutlined />}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <div>
              <div style={{ fontWeight: 600, color: '#262626' }}>
                {record.full_name ? record.full_name : `@${record.username}`}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username) => <span style={{ fontFamily: 'monospace', color: '#595959' }}>@{username}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = ROLE_COLORS[role?.toLowerCase()] || 'default';
        return (
          <Tag color={color} style={{ borderRadius: 12, textTransform: 'capitalize', fontWeight: 500 }}>
            {role || 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Store',
      dataIndex: 'store_id',
      key: 'store_id',
      align: 'center',
      render: (storeId) =>
        storeId ? (
          <Tag icon={<ShopOutlined />} color="geekblue" style={{ borderRadius: 8 }}>
            Store #{storeId}
          </Tag>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => {
        const isActive = active === 1 || active === true || active === '1';
        return (
          <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 12 }}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      render: (date) => (date ? formatDate(date) : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 110,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>

          <Tooltip title="Delete User">
            <Popconfirm
              title="Delete user"
              description={`Are you sure you want to delete "${record.username}"?`}
              onConfirm={() => onDeleteUser(record.user_id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="user_id"
      loading={loading}
      pagination={{
        pageSize: 8,
        showSizeChanger: true,
        pageSizeOptions: ['5', '8', '15', '30'],
        showTotal: (total) => `Total ${total} users`,
      }}
    />
  );
}

export default UserTable;
