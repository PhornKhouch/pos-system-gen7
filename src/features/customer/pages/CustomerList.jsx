import React, { useState } from 'react';
import { Card, Input, Select, Button, Space, Alert, Tag, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { CustomerTable } from '../components/CustomerTable';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { useCustomers } from '../hooks/useCustomers';
import { Header } from '@/components/layout/Header';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
];

export function CustomerList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewingId, setViewingId] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const { customers, total, loading, error, refetch } = useCustomers({
    search: debouncedSearch,
    active: status,
  });

  return (
    <div className="customer-management-container">
      <Header
        title="Customers"
        subtitle="View customer profiles, contact details, and loyalty points"
      />

      {error && (
        <Alert
          type="error"
          message="Failed to load customers"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Search & Filter Controls */}
      <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap size="middle">
            <Input
              placeholder="Search by name, email, or phone..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 140 }}
              options={STATUS_FILTER_OPTIONS}
            />
          </Space>

          <Space size="middle">
            <Tooltip title="Refresh customer list">
              <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
                Refresh
              </Button>
            </Tooltip>
            <Tag color="blue" style={{ borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>
              Total: {total} {total === 1 ? 'customer' : 'customers'}
            </Tag>
          </Space>
        </div>
      </Card>

      {/* Customers Table Card */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <CustomerTable
          customers={customers}
          loading={loading}
          onView={(record) => setViewingId(record.customer_id)}
        />
      </Card>

      <CustomerDetailModal
        customerId={viewingId}
        open={viewingId !== null}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}

export default CustomerList;
