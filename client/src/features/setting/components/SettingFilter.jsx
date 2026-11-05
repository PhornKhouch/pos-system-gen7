import React from 'react';
import { Input, Select, Space, Button, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { SETTING_TYPES } from '../services/settingApi';

const TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  ...SETTING_TYPES.map((type) => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type })),
];

const SCOPE_OPTIONS = [
  { label: 'All Scopes', value: 'all' },
  { label: 'Global only', value: 'global' },
];

export function SettingFilter({
  search = '',
  onSearchChange,
  type = 'all',
  onTypeChange,
  scope = 'all',
  onScopeChange,
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
        gap: 12,
      }}
    >
      <Space wrap size="middle">
        <Input
          placeholder="Search by key or value..."
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Select value={type} onChange={onTypeChange} style={{ width: 140 }} options={TYPE_OPTIONS} />
        <Select
          value={scope}
          onChange={onScopeChange}
          style={{ width: 150 }}
          options={SCOPE_OPTIONS}
        />
      </Space>

      <Space wrap size="small">
        <Tag color="blue" style={{ borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>
          Total: {totalCount} {totalCount === 1 ? 'setting' : 'settings'}
        </Tag>
        <Button icon={<ReloadOutlined spin={loading} />} onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
          Add Setting
        </Button>
      </Space>
    </div>
  );
}

export default SettingFilter;
