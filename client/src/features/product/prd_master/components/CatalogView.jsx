import React, { useState } from 'react';
import { Table, Tag, Space, Button, Card, Radio, Avatar, Typography, Tooltip } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatCurrency';

const { Text } = Typography;

const MOCK_PRODUCTS = [
  {
    key: '1',
    id: 'MBA-M4-256',
    name: 'MacBook Air 13" M4 256GB',
    sku: 'MBA-M4-256',
    initials: 'MA',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Laptops',
    cost: 862,
    retail: 1099,
    margin: '21.6%',
    onHand: 14,
    status: 'Active',
  },
  {
    key: '2',
    id: 'IPH-17P-256',
    name: 'iPhone 17 Pro 256GB',
    sku: 'IPH-17P-256',
    initials: 'IP',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Phones',
    cost: 1012,
    retail: 1249,
    margin: '19.0%',
    onHand: 6,
    status: 'Active',
  },
  {
    key: '3',
    id: 'SSD-990P-1T',
    name: 'Samsung 990 Pro 1TB NVMe',
    sku: 'SSD-990P-1T',
    initials: 'SA',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Components',
    cost: 98,
    retail: 129,
    margin: '24.0%',
    onHand: 42,
    status: 'Active',
  },
  {
    key: '4',
    id: 'MSE-MX3S-BK',
    name: 'Logitech MX Master 3S',
    sku: 'MSE-MX3S-BK',
    initials: 'LO',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Accessories',
    cost: 74,
    retail: 109,
    margin: '32.1%',
    onHand: 3,
    status: 'Low stock',
  },
  {
    key: '5',
    id: 'AUD-XM6-BK',
    name: 'Sony WH-1000XM6',
    sku: 'AUD-XM6-BK',
    initials: 'SO',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Audio',
    cost: 268,
    retail: 349,
    margin: '23.2%',
    onHand: 0,
    status: 'Out of stock',
  },
  {
    key: '6',
    id: 'PWR-A737',
    name: 'Anker 737 Power Bank 24K',
    sku: 'PWR-A737',
    initials: 'AN',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Accessories',
    cost: 72,
    retail: 99,
    margin: '27.3%',
    onHand: 28,
    status: 'Active',
  },
  {
    key: '7',
    id: 'KBD-K8P-RGB',
    name: 'Keychron K8 Pro RGB',
    sku: 'KBD-K8P-RGB',
    initials: 'KE',
    avatarColor: '#f0f0f0',
    avatarTextColor: '#595959',
    category: 'Accessories',
    cost: 71,
    retail: 99,
    margin: '28.3%',
    onHand: 17,
    status: 'Active',
  },
];

export function CatalogView() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const filteredProducts =
    selectedFilter === 'All'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === selectedFilter);

  const columns = [
    {
      title: 'PRODUCT',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Avatar
            shape="square"
            size={36}
            style={{
              backgroundColor: record.avatarColor,
              color: record.avatarTextColor,
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '6px',
            }}
          >
            {record.initials}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '13.5px', display: 'block', color: '#1f1f1f' }}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>
              {record.sku}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <span style={{ color: '#434343', fontWeight: 500 }}>{cat}</span>,
    },
    {
      title: 'COST',
      dataIndex: 'cost',
      key: 'cost',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'RETAIL',
      dataIndex: 'retail',
      key: 'retail',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'MARGIN',
      dataIndex: 'margin',
      key: 'margin',
      render: (margin) => <span style={{ color: '#595959' }}>{margin}</span>,
    },
    {
      title: 'ON HAND',
      dataIndex: 'onHand',
      key: 'onHand',
      render: (stock, record) => (
        <span
          style={{
            fontWeight: 600,
            color: record.status === 'Out of stock' ? '#ff4d4f' : '#262626',
          }}
        >
          {stock}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'Active') {
          return (
            <Tag
              color="success"
              style={{
                borderRadius: '10px',
                padding: '2px 8px',
                fontWeight: 500,
                border: 'none',
                background: '#f6ffed',
                color: '#52c41a',
              }}
            >
              Active
            </Tag>
          );
        }
        if (status === 'Low stock') {
          return (
            <Tag
              color="warning"
              style={{
                borderRadius: '10px',
                padding: '2px 8px',
                fontWeight: 500,
                border: 'none',
                background: '#fffbe6',
                color: '#d48806',
              }}
            >
              Low stock
            </Tag>
          );
        }
        return (
          <Tag
            color="error"
            style={{
              borderRadius: '10px',
              padding: '2px 8px',
              fontWeight: 500,
              border: 'none',
              background: '#fff2f0',
              color: '#ff4d4f',
            }}
          >
            Out of stock
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="catalog-view-container">
      {/* Filter Pills & Actions Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Category Pills */}
        <Radio.Group
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          size="middle"
          className="custom-filter-pills"
        >
          <Radio.Button value="All">All 1,284</Radio.Button>
          <Radio.Button value="Laptops">Laptops 148</Radio.Button>
          <Radio.Button value="Phones">Phones 212</Radio.Button>
          <Radio.Button value="Accessories">Accessories 604</Radio.Button>
          <Radio.Button value="Components">Components 186</Radio.Button>
          <Radio.Button value="Audio">Audio 134</Radio.Button>
        </Radio.Group>

        {/* Toolbar Buttons */}
        <Space wrap size="small">
          <Button icon={<UploadOutlined />}>Import CSV</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button icon={<EditOutlined />}>Bulk edit prices</Button>
        </Space>
      </div>

      {/* Catalog Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={columns}
          dataSource={filteredProducts}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

export default CatalogView;
