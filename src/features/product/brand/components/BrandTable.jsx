import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Typography, Empty } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';

const { Text } = Typography;

export function BrandTable({
  brands = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      title: 'Brand ID',
      dataIndex: 'brand_id',
      key: 'brand_id',
      width: 110,
      render: (id) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: '13px',
            color: '#1677ff',
            backgroundColor: 'rgba(22, 119, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          #{id}
        </span>
      ),
    },
    {
      title: 'Brand Name',
      dataIndex: 'brand_name',
      key: 'brand_name',
      sorter: (a, b) => a.brand_name.localeCompare(b.brand_name),
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block', color: '#1f1f1f' }}>
            {text}
          </Text>
          {record.description && (
            <Text
              type="secondary"
              style={{
                fontSize: '12px',
                display: 'block',
                maxWidth: 320,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span style={{ color: text ? 'inherit' : '#bfbfbf' }}>
          {text || 'No description'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 130,
      render: (active) => {
        const isActive = active === 1 || active === true;
        return (
          <Tag
            icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            color={isActive ? 'success' : 'default'}
            style={{
              borderRadius: '12px',
              padding: '2px 10px',
              fontWeight: 500,
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 150,
      render: (date) => (
        <Space size="small" style={{ fontSize: '13px', color: '#595959' }}>
          <CalendarOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
          <span>{formatDate(date) || '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Brand">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Brand">
            <Popconfirm
              title="Delete Brand"
              description={`Are you sure you want to delete "${record.brand_name}"?`}
              onConfirm={() => onDelete(record.brand_id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="brand_id"
      columns={columns}
      dataSource={brands}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} brands`,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No brands found matching criteria"
          />
        ),
      }}
      style={{ overflowX: 'auto' }}
    />
  );
}

export default BrandTable;
