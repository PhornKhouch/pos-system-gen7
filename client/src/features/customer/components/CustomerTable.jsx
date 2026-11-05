import React from 'react';
import { Table, Tag, Avatar, Space, Button, Tooltip } from 'antd';
import { EyeOutlined, PhoneOutlined, EnvironmentOutlined, StarFilled, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/formatDate';

const isActiveValue = (active) => active === 1 || active === true || active === '1';

export function CustomerTable({ customers, loading, onView }) {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'customer_id',
      key: 'customer_id',
      width: 70,
      align: 'center',
      render: (id) => <span style={{ fontWeight: 600, color: '#8c8c8c' }}>#{id}</span>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => {
        const name = record.customer_name || 'Customer';
        return (
          <Space size="middle">
            <Avatar size={40} style={{ backgroundColor: '#1677ff' }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#262626' }}>{name}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email || '—'}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) =>
        phone ? (
          <span>
            <PhoneOutlined style={{ color: '#8c8c8c', marginRight: 6 }} />
            {phone}
          </span>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => {
        const location = [record.city, record.country].filter(Boolean).join(', ');
        return location ? (
          <span>
            <EnvironmentOutlined style={{ color: '#8c8c8c', marginRight: 6 }} />
            {location}
          </span>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        );
      },
    },
    {
      title: 'Loyalty Points',
      dataIndex: 'loyalty_points',
      key: 'loyalty_points',
      align: 'center',
      sorter: (a, b) => (a.loyalty_points || 0) - (b.loyalty_points || 0),
      render: (points) => (
        <Tag icon={<StarFilled />} color="gold" style={{ borderRadius: 12 }}>
          {points || 0}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => {
        const isActive = isActiveValue(active);
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
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="View Customer Orders">
            <Button
              type="text"
              icon={<ShoppingOutlined style={{ color: '#52c41a' }} />}
              onClick={() => navigate(`/customer-orders?customer_id=${record.customer_id}`)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={customers}
      rowKey="customer_id"
      loading={loading}
      pagination={{
        pageSize: 8,
        showSizeChanger: true,
        pageSizeOptions: ['5', '8', '15', '30'],
        showTotal: (total) => `Total ${total} customers`,
      }}
    />
  );
}

export default CustomerTable;
