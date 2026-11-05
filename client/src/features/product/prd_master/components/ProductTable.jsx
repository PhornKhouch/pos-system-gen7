import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Typography, Avatar, Empty } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BarcodeOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatCurrency';
import { getAssetUrl } from '@/utils/imageUtils';

const { Text } = Typography;

// Color palette for product avatar initials
const AVATAR_COLORS = [
  { bg: 'rgba(22, 119, 255, 0.12)', text: '#1677ff' },
  { bg: 'rgba(114, 46, 209, 0.12)', text: '#722ed1' },
  { bg: 'rgba(19, 194, 194, 0.12)', text: '#13c2c2' },
  { bg: 'rgba(82, 196, 26, 0.12)', text: '#52c41a' },
  { bg: 'rgba(250, 140, 22, 0.12)', text: '#fa8c16' },
  { bg: 'rgba(235, 47, 150, 0.12)', text: '#eb2f96' },
];

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'PR';
}

function getAvatarStyle(id = 0) {
  const idx = Math.abs(Number(id) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function ProductTable({
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onManageImages,
}) {
  const columns = [
    {
      title: 'PRODUCT',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text, record) => {
        const initials = getInitials(text);
        const avatarStyle = getAvatarStyle(record.product_id);
        const imageUrl = getAssetUrl(record.image);
        return (
          <Space size="middle" style={{ alignItems: 'center' }}>
            <Avatar
              shape="square"
              size={40}
              src={imageUrl}
              style={{
                backgroundColor: avatarStyle.bg,
                color: avatarStyle.text,
                fontWeight: 700,
                fontSize: '13px',
                borderRadius: '8px',
                border: `1px solid ${avatarStyle.text}22`,
                flexShrink: 0,
              }}
            >
              {!imageUrl && initials}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: '14px', display: 'block', color: '#1f1f1f' }}>
                {text}
              </Text>
              <Space size={6}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#595959',
                    backgroundColor: '#f5f5f5',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  SKU: {record.sku}
                </span>
                {record.barcode && (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#8c8c8c',
                    }}
                  >
                    <BarcodeOutlined style={{ marginRight: 3 }} />
                    {record.barcode}
                  </span>
                )}
              </Space>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <span style={{ color: '#434343', fontWeight: 500, fontSize: '13px' }}>
          {cat?.category_name || '—'}
        </span>
      ),
    },
    {
      title: 'BRAND',
      dataIndex: 'brand',
      key: 'brand',
      render: (b) => (
        <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 500 }}>
          {b?.brand_name || '—'}
        </Tag>
      ),
    },
    {
      title: 'ATTRIBUTE',
      dataIndex: 'attribute',
      key: 'attribute',
      render: (attr) => {
        if (!attr) return <span style={{ color: '#bfbfbf' }}>—</span>;
        return (
          <Tag color="purple" style={{ borderRadius: 6, fontSize: '12px' }}>
            {attr.attribute_name}: {attr.attribute_value}
          </Tag>
        );
      },
    },
    {
      title: 'COST',
      dataIndex: 'cost',
      key: 'cost',
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      render: (cost) => (
        <span style={{ color: '#595959', fontSize: '13px' }}>
          {formatCurrency(cost || 0)}
        </span>
      ),
    },
    {
      title: 'RETAIL',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => Number(a.price || 0) - Number(b.price || 0),
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#1f1f1f', fontSize: '13px' }}>
          {formatCurrency(price || 0)}
        </span>
      ),
    },
    {
      title: 'MARGIN',
      key: 'margin',
      render: (_, record) => {
        const price = parseFloat(record.price) || 0;
        const cost = parseFloat(record.cost) || 0;
        if (price <= 0) return <span style={{ color: '#bfbfbf' }}>—</span>;
        const marginPct = (((price - cost) / price) * 100).toFixed(1);
        const isPositive = price >= cost;
        return (
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: isPositive ? '#52c41a' : '#ff4d4f',
            }}
          >
            {marginPct}%
          </span>
        );
      },
    },
    {
      title: 'ON HAND',
      dataIndex: 'quantity_stock',
      key: 'quantity_stock',
      sorter: (a, b) => Number(a.quantity_stock || 0) - Number(b.quantity_stock || 0),
      render: (stock) => {
        const qty = Number(stock || 0);
        let color = '#262626';
        if (qty <= 0) color = '#ff4d4f';
        else if (qty <= 5) color = '#fa8c16';
        return (
          <span style={{ fontWeight: 600, fontSize: '13px', color }}>
            {qty}
          </span>
        );
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'active',
      key: 'active',
      width: 120,
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
      title: 'ACTIONS',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Product Images">
            <Button
              type="text"
              size="small"
              icon={<PictureOutlined style={{ color: '#13c2c2' }} />}
              onClick={() => onManageImages?.(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Popconfirm
              title="Delete Product"
              description={`Are you sure you want to delete "${record.product_name}"?`}
              onConfirm={() => onDelete(record.product_id)}
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
      rowKey="product_id"
      columns={columns}
      dataSource={products}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No products found matching criteria"
          />
        ),
      }}
      style={{ overflowX: 'auto' }}
    />
  );
}

export default ProductTable;
