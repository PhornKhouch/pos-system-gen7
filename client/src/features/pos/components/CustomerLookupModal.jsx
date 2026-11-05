import React, { useState } from 'react';
import { Modal, Input, Radio, Typography, Space, Tag, Button } from 'antd';
import { UserOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { MOCK_CUSTOMERS } from '../services/mockData';

const { Text } = Typography;

export function CustomerLookupModal({
  open,
  onClose,
  currentCustomer,
  onSelectCustomer,
}) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(currentCustomer?.id || 'walk-in');

  const filteredCustomers = MOCK_CUSTOMERS.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleConfirm = () => {
    const found = MOCK_CUSTOMERS.find((c) => c.id === selectedId);
    if (found) {
      onSelectCustomer(found);
    }
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined style={{ color: '#2563eb' }} />
          <span>Customer Loyalty & Lookup</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Select Customer"
      okButtonProps={{ style: { backgroundColor: '#2563eb' } }}
      width={520}
    >
      <div style={{ padding: '8px 0 16px' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Search customer by name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16, height: 40, borderRadius: 8 }}
        />

        <Radio.Group
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedId(cust.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border:
                  selectedId === cust.id
                    ? '1.5px solid #2563eb'
                    : '1px solid #e2e8f0',
                borderRadius: 10,
                backgroundColor:
                  selectedId === cust.id ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Space align="center">
                <Radio value={cust.id} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cust.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {cust.phone || 'Default Walk-in guest'}
                  </Text>
                </div>
              </Space>

              <div>
                {cust.loyaltyTier && cust.id !== 'walk-in' ? (
                  <Space>
                    <Tag color="blue">{cust.loyaltyTier}</Tag>
                    <Tag color="green">{cust.loyaltyPoints} pts</Tag>
                  </Space>
                ) : (
                  <Tag>Standard</Tag>
                )}
              </div>
            </div>
          ))}
        </Radio.Group>
      </div>
    </Modal>
  );
}

export default CustomerLookupModal;
