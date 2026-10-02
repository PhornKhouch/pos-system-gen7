import React from 'react';
import { Tabs, Breadcrumb, Typography, Input, Select, Button, Space } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TagOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

// Feature sub-pages / tabs
import { CatalogView } from '../prd_master/components/CatalogView';
import { Category } from '../category/page/Category';
import { Brand } from '../brand/page/Brand';
import { Attribute } from '../prdattribute/page/Attribute';

const { Title, Text } = Typography;

export function ProductManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'catalog';

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const tabItems = [
    {
      key: 'catalog',
      label: (
        <Space size={6}>
          <ShoppingOutlined />
          <span>Catalog</span>
        </Space>
      ),
      children: <CatalogView />,
    },
    {
      key: 'categories',
      label: (
        <Space size={6}>
          <AppstoreOutlined />
          <span>Categories</span>
        </Space>
      ),
      children: <Category />,
    },
    {
      key: 'brands',
      label: (
        <Space size={6}>
          <TagOutlined />
          <span>Brands</span>
        </Space>
      ),
      children: <Brand />,
    },
    {
      key: 'attributes',
      label: (
        <Space size={6}>
          <SlidersOutlined />
          <span>Attributes</span>
        </Space>
      ),
      children: <Attribute />,
    },
  ];

  return (
    <div className="product-page-container">
      {/* Top Breadcrumb & Page Header matching Mockup */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          MERCHANDISING / PRODUCTS
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Products & catalog
            </Title>
          </div>

          <Space wrap size="middle">
            {/* Header Global Search Input */}
            <Input
              placeholder="Search orders, SKUs, customers..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              suffix={
                <span
                  style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                    background: '#f0f0f0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  ⌘K
                </span>
              }
              style={{ width: 280, borderRadius: 8 }}
              allowClear
            />

            {/* Location / Branch Selector */}
            <Select
              defaultValue="phnom-penh"
              style={{ width: 175 }}
              suffixIcon={<EnvironmentOutlined style={{ color: '#1677ff' }} />}
              options={[
                { value: 'phnom-penh', label: 'Phnom Penh · Main' },
                { value: 'siem-reap', label: 'Siem Reap · Branch 1' },
                { value: 'battambang', label: 'Battambang · Branch 2' },
              ]}
            />

            {/* Main Action Button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8, fontWeight: 500 }}
              onClick={() => {
                if (currentTab !== 'categories') {
                  setSearchParams({ tab: 'categories' });
                }
              }}
            >
              + Add product
            </Button>
          </Space>
        </div>
      </div>

      {/* Tabs matching mockup */}
      <Tabs
        activeKey={currentTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        className="product-navigation-tabs"
        style={{
          marginTop: 8,
        }}
      />
    </div>
  );
}

export default ProductManagement;
