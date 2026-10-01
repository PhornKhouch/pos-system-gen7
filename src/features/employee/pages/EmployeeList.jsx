import React, { useState } from 'react';
import { Card, Input, Select, Button, Space, Modal, App } from 'antd';
import { UserAddOutlined, SearchOutlined } from '@ant-design/icons';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeForm } from '../components/EmployeeForm';
import { useEmployees } from '../hooks/useEmployees';
import { Header } from '@/components/layout/Header';
import { useModal } from '@/hooks/useModal';
import { useDebounce } from '@/hooks/useDebounce';
import { DEPARTMENTS } from '@/utils/constants';

export function EmployeeList() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();
  const { message } = App.useApp();

  const { employees, loading, addEmployee, removeEmployee } = useEmployees({
    search: debouncedSearch,
    department,
  });

  const handleCreateEmployee = async (formData) => {
    try {
      await addEmployee(formData);
      message.success('Employee added to directory!');
      close();
    } catch (err) {
      message.error(err.message || 'Failed to add employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await removeEmployee(id);
      message.success('Employee record deleted!');
    } catch (err) {
      message.error(err.message || 'Failed to delete employee');
    }
  };

  return (
    <div>
      <Header
        title="Employee Directory"
        subtitle="Manage staff compensation, team assignments, and organizational records"
        action={
          <Button type="primary" onClick={open} icon={<UserAddOutlined />}>
            Add Employee
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Search employees by name, title..."
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
        <EmployeeTable
          employees={employees}
          loading={loading}
          onDeleteEmployee={handleDeleteEmployee}
        />
      </Card>

      <Modal
        open={isOpen}
        onCancel={close}
        title="Add Employee to Directory"
        footer={null}
        destroyOnClose
      >
        <div style={{ paddingTop: 12 }}>
          <EmployeeForm onSubmit={handleCreateEmployee} onCancel={close} />
        </div>
      </Modal>
    </div>
  );
}

export default EmployeeList;
