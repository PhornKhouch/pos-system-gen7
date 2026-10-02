import React from 'react';
import { Card, Button, Space, Typography, Tag, Table } from 'antd';
import { AppstoreAddOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function Attribute() {
  const mockAttributes = [
    { key: '1', name: 'Color', values: ['Space Gray', 'Silver', 'Midnight', 'Starlight'], status: 'Active' },
    { key: '2', name: 'Storage', values: ['128GB', '256GB', '512GB', '1TB', '2TB'], status: 'Active' },
    { key: '3', name: 'RAM Size', values: ['8GB', '16GB', '24GB', '32GB', '64GB'], status: 'Active' },
    { key: '4', name: 'Connectivity', values: ['Bluetooth 5.3', 'Wi-Fi 6E', 'USB-C', 'Thunderbolt 4'], status: 'Active' },
  ];

  const columns = [
    {
      title: 'Attribute Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Configured Values',
      dataIndex: 'values',
      key: 'values',
      render: (values) => (
        <Space wrap size={[4, 8]}>
          {values.map((v) => (
            <Tag key={v} color="blue">
              {v}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag color="success">{status}</Tag>,
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
      title={
        <Space>
          <FilterOutlined style={{ color: '#1677ff' }} />
          <span>Product Attributes & Variants</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          Add Attribute
        </Button>
      }
    >
      <Table columns={columns} dataSource={mockAttributes} pagination={false} />
    </Card>
  );
}

export default Attribute;
