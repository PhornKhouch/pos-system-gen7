import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Typography, Empty } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  ShopOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';

const { Text } = Typography;

export const TYPE_COLORS = {
  text: 'default',
  number: 'blue',
  boolean: 'green',
  email: 'purple',
  url: 'cyan',
  color: 'magenta',
  json: 'orange',
};

function SettingValue({ record }) {
  const value = record.setting_value;
  if (value === null || value === undefined || value === '') {
    return <Text type="secondary" italic>empty</Text>;
  }

  switch (record.setting_type) {
    case 'boolean': {
      const on = value === 'true';
      return (
        <Tag icon={on ? <CheckCircleOutlined /> : <StopOutlined />} color={on ? 'success' : 'default'}>
          {on ? 'True' : 'False'}
        </Tag>
      );
    }
    case 'color':
      return (
        <Space size="small">
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 18,
              borderRadius: 4,
              background: value,
              border: '1px solid #d9d9d9',
              verticalAlign: 'middle',
            }}
          />
          <Text code>{value}</Text>
        </Space>
      );
    case 'url':
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
          {value}
        </a>
      );
    case 'json':
      return (
        <Tooltip title={<pre style={{ margin: 0, maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(record.parsed_value, null, 2)}</pre>}>
          <Text code ellipsis style={{ maxWidth: 280 }}>
            {value}
          </Text>
        </Tooltip>
      );
    default:
      return (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 320 }}>
          {value}
        </Text>
      );
  }
}

export function SettingTable({ settings = [], loading = false, onEdit, onDelete }) {
  const columns = [
    {
      title: 'Key',
      dataIndex: 'setting_key',
      key: 'setting_key',
      sorter: (a, b) => a.setting_key.localeCompare(b.setting_key),
      render: (key) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 13,
            color: '#1677ff',
            backgroundColor: 'rgba(22, 119, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {key}
        </span>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'setting_value',
      key: 'setting_value',
      render: (_, record) => <SettingValue record={record} />,
    },
    {
      title: 'Type',
      dataIndex: 'setting_type',
      key: 'setting_type',
      width: 110,
      render: (type) => (
        <Tag color={TYPE_COLORS[type] || 'default'} style={{ borderRadius: 12, padding: '2px 10px' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'store_id',
      key: 'store_id',
      width: 130,
      sorter: (a, b) => (a.store_id || 0) - (b.store_id || 0),
      render: (storeId) =>
        storeId === null || storeId === undefined ? (
          <Tag icon={<GlobalOutlined />} color="geekblue">Global</Tag>
        ) : (
          <Tag icon={<ShopOutlined />} color="gold">Store #{storeId}</Tag>
        ),
    },
    {
      title: 'Updated',
      dataIndex: 'updated_date',
      key: 'updated_date',
      width: 140,
      render: (date) => (
        <Space size="small" style={{ fontSize: 13, color: '#595959' }}>
          <CalendarOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
          <span>{formatDate(date) || '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Setting">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Setting">
            <Popconfirm
              title="Delete Setting"
              description={`Are you sure you want to delete "${record.setting_key}"?`}
              onConfirm={() => onDelete(record.setting_id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="setting_id"
      columns={columns}
      dataSource={settings}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} settings`,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No settings yet. Click “Add Setting” to create one."
          />
        ),
      }}
      scroll={{ x: 800 }}
    />
  );
}

export default SettingTable;
