import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Typography, Empty } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/formatDate';

const { Text } = Typography;

export function AttributeTable({
  attributes = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      title: 'Attribute ID',
      dataIndex: 'attribute_id',
      key: 'attribute_id',
      width: 110,
      render: (id) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: '13px',
            color: '#1677ff',
            backgroundColor: 'rgba(22, 119, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          #{id}
        </span>
      ),
    },
    {
      title: 'Attribute Name',
      dataIndex: 'attribute_name',
      key: 'attribute_name',
      sorter: (a, b) => a.attribute_name.localeCompare(b.attribute_name),
      render: (name) => (
        <Space size={6}>
          <SlidersOutlined style={{ color: '#1677ff', fontSize: '13px' }} />
          <Text strong style={{ fontSize: '14px', color: '#1f1f1f' }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Attribute Value',
      dataIndex: 'attribute_value',
      key: 'attribute_value',
      sorter: (a, b) => a.attribute_value.localeCompare(b.attribute_value),
      render: (value) => (
        <Tag
          color="blue"
          style={{
            borderRadius: '6px',
            fontSize: '13px',
            padding: '2px 10px',
            fontWeight: 500,
          }}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 130,
      render: (active) => {
        const isActive = active === 1 || active === true;
        return (
          <Tag
            icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            color={isActive ? 'success' : 'default'}
            style={{
              borderRadius: '12px',
              padding: '2px 10px',
              fontWeight: 500,
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 160,
      render: (date) => (
        <Space size="small" style={{ fontSize: '13px', color: '#595959' }}>
          <CalendarOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
          <span>{formatDate(date) || '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Attribute">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Attribute">
            <Popconfirm
              title="Delete Attribute"
              description={`Are you sure you want to delete "${record.attribute_name}: ${record.attribute_value}"?`}
              onConfirm={() => onDelete(record.attribute_id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="attribute_id"
      columns={columns}
      dataSource={attributes}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} attributes`,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No attributes found matching criteria"
          />
        ),
      }}
      style={{ overflowX: 'auto' }}
    />
  );
}

export default AttributeTable;
