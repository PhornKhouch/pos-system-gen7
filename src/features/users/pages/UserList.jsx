import React, { useState } from 'react';
import { Card, Input, Select, Button, Space, Modal, App } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import { Header } from '@/components/layout/Header';
import { useModal } from '@/hooks/useModal';
import { useDebounce } from '@/hooks/useDebounce';
import { DEPARTMENTS } from '@/utils/constants';

export function UserList() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();
  const { message } = App.useApp();

  const { users, loading, addUser, removeUser } = useUsers({
    search: debouncedSearch,
    department,
  });

  const handleCreateUser = async (formData) => {
    try {
      await addUser(formData);
      message.success('User added successfully!');
      close();
    } catch (err) {
      message.error(err.message || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await removeUser(id);
      message.success('User deleted successfully!');
    } catch (err) {
      message.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <Header
        title="User Management"
        subtitle="Manage access permissions, department roles, and administrative profiles"
        action={
          <Button type="primary" onClick={open} icon={<PlusOutlined />}>
            Add New User
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Search users by name or email..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            value={department}
            onChange={setDepartment}
            style={{ width: 200 }}
          >
            <Select.Option value="All">All Departments</Select.Option>
            {DEPARTMENTS.map((d) => (
              <Select.Option key={d} value={d}>
                {d}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <UserTable
          users={users}
          loading={loading}
          onDeleteUser={handleDeleteUser}
        />
      </Card>

      <Modal
        open={isOpen}
        onCancel={close}
        title="Add New User"
        footer={null}
        destroyOnClose
      >
        <div style={{ paddingTop: 12 }}>
          <UserForm onSubmit={handleCreateUser} onCancel={close} />
        </div>
      </Modal>
    </div>
  );
}

export default UserList;
