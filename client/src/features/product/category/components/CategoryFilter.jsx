import React from 'react';
import { Input, Radio, Space, Button, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';

export function CategoryFilter({
  search = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
  onRefresh,
  onAddClick,
  loading = false,
  totalCount = 0,
}) {
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
          placeholder="Search category by name..."
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 280 }}
          allowClear
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
          Add Category
        </Button>
      </Space>
    </div>
  );
}

export default CategoryFilter;
