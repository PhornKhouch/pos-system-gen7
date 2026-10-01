import React from 'react';
import { Card, Table, Tag, Space, Button } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/utils/formatCurrency';

export function ProductList() {
  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <ShopOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : 'orange'}>
          {stock} in stock
        </Tag>
      ),
    },
  ];

  const dataSource = [
    { key: '1', name: 'Logitech MX Master 3S', category: 'Accessories', price: 99, stock: 31 },
    { key: '2', name: 'Keychron K2 Mechanical Keyboard', category: 'Accessories', price: 89, stock: 19 },
    { key: '3', name: 'Dell UltraSharp 27 Inch 4K', category: 'Monitors', price: 549, stock: 8 },
    { key: '4', name: 'Anker 737 Power Bank', category: 'Charging', price: 129, stock: 24 },
  ];

  return (
    <div>
      <Header
        title="Products Catalog"
        subtitle="Submenu Sample: Browse and manage retail store inventory"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        }
      />
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </Card>
    </div>
  );
}

export default ProductList;
