import React, { useState, useEffect } from 'react';
import { Input, Radio, Space, Button, Badge, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { categoryApi } from '../../category/services/categoryApi';
import { brandApi } from '../../brand/services/brandApi';

export function ProductFilter({
  search = '',
  onSearchChange,
  categoryId = 'all',
  onCategoryChange,
  brandId = 'all',
  onBrandChange,
  status = 'all',
  onStatusChange,
  onRefresh,
  onAddClick,
  loading = false,
  totalCount = 0,
}) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Fetch categories and brands for filter dropdowns
    categoryApi.getCategories().then((res) => {
      if (res && res.list) setCategories(res.list);
    }).catch(() => {});

    brandApi.getBrands().then((res) => {
      if (res && res.list) setBrands(res.list);
    }).catch(() => {});
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      <Space wrap size="middle">
        <Input
          placeholder="Search by product name, SKU, or barcode..."
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 310 }}
          allowClear
        />

        <Select
          value={categoryId}
          onChange={onCategoryChange}
          style={{ minWidth: 150 }}
          placeholder="All Categories"
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map((c) => ({
              value: c.category_id,
              label: c.category_name,
            })),
          ]}
        />

        <Select
          value={brandId}
          onChange={onBrandChange}
          style={{ minWidth: 140 }}
          placeholder="All Brands"
          options={[
            { value: 'all', label: 'All Brands' },
            ...brands.map((b) => ({
              value: b.brand_id,
              label: b.brand_name,
            })),
          ]}
        />

        <Radio.Group
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">
            All <Badge count={totalCount} overflowCount={999} style={{ backgroundColor: '#1677ff', marginLeft: 4 }} />
          </Radio.Button>
          <Radio.Button value="1">Active</Radio.Button>
          <Radio.Button value="0">Inactive</Radio.Button>
        </Radio.Group>
      </Space>

      <Space wrap size="small">
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddClick}
        >
          Add Product
        </Button>
      </Space>
    </div>
  );
}

export default ProductFilter;
