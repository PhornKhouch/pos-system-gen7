import React, { useState } from 'react';
import { Card, Input, Select, Button, Space, Modal, App, Alert, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import { Header } from '@/components/layout/Header';
import { useModal } from '@/hooks/useModal';
import { useDebounce } from '@/hooks/useDebounce';

const ROLE_FILTER_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Cashier', value: 'cashier' },
  { label: 'Staff', value: 'staff' },
];

const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
];

export function UserList() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();
  const { message } = App.useApp();

  const {
    users,
    total,
    loading,
    submitting,
    error,
    refetch,
    addUser,
    editUser,
    removeUser,
  } = useUsers({
    search: debouncedSearch,
    role,
    active: status,
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    open();
  };

  // Open Edit Modal
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    open();
  };

  // Close Modal
  const handleCloseModal = () => {
    close();
    setSelectedUser(null);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser && selectedUser.user_id) {
        const res = await editUser(selectedUser.user_id, formData);
        message.success(res?.message || 'User updated successfully!');
      } else {
        const res = await addUser(formData);
        message.success(res?.message || 'User created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      message.error(err.message || 'Operation failed. Please try again.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    try {
      const res = await removeUser(id);
      message.success(res?.message || 'User deleted successfully!');
    } catch (err) {
      message.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="user-management-container">
      <Header
        title="User Management"
        subtitle="Manage POS system accounts, user roles, credentials, and store assignments"
        action={
          <Button type="primary" onClick={handleOpenCreateModal} icon={<PlusOutlined />} size="middle">
            Add New User
          </Button>
        }
      />

      {/* Error Banner */}
      {error && (
        <Alert
          type="error"
          message="Failed to load users"
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
              placeholder="Search by username, email, or name..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />

            <Select
              value={role}
              onChange={setRole}
              style={{ width: 160 }}
              options={ROLE_FILTER_OPTIONS}
              placeholder="Filter by Role"
            />

            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 140 }}
              options={STATUS_FILTER_OPTIONS}
              placeholder="Filter by Status"
            />
          </Space>

          <Space size="middle">
            <Tooltip title="Refresh user list">
              <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
                Refresh
              </Button>
            </Tooltip>
            <Tag color="blue" style={{ borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>
              Total: {total} {total === 1 ? 'user' : 'users'}
            </Tag>
          </Space>
        </div>
      </Card>

      {/* Users Table Card */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDeleteUser={handleDeleteUser}
        />
      </Card>

      {/* Create / Edit User Modal */}
      <Modal
        open={isOpen}
        onCancel={handleCloseModal}
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {selectedUser ? `Edit User: @${selectedUser.username}` : 'Add New User'}
          </span>
        }
        footer={null}
        destroyOnClose
        width={560}
      >
        <div style={{ paddingTop: 12 }}>
          <UserForm
            user={selectedUser}
            loading={submitting}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>
    </div>
  );
}

export default UserList;
