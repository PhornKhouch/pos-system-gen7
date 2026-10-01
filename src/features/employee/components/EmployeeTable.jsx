import React from 'react';
import { Table, Tag, Avatar, Space, Button, Popconfirm } from 'antd';
import { IdcardOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export function EmployeeTable({ employees, loading, onDeleteEmployee }) {
  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: '#52c41a' }} icon={<IdcardOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Annual Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => <span style={{ fontWeight: 600 }}>{formatCurrency(salary)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'Full-time') color = 'green';
        else if (status === 'Contract') color = 'orange';
        else if (status === 'Intern') color = 'purple';
        return (
          <Tag color={color} style={{ borderRadius: 12 }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete employee"
          description={`Are you sure you want to remove ${record.name}?`}
          onConfirm={() => onDeleteEmployee(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={employees}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 5, showSizeChanger: true }}
    />
  );
}

export default EmployeeTable;
