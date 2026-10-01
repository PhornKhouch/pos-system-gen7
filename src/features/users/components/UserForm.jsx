import React from 'react';
import { Form, Input, Select, Button, Space, Radio } from 'antd';
import { ROLES, DEPARTMENTS } from '@/utils/constants';

export function UserForm({ onSubmit, onCancel, isLoading }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        role: ROLES.EMPLOYEE,
        department: 'Engineering',
        status: 'Active',
      }}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: true, message: 'Please enter the user full name!' }]}
      >
        <Input placeholder="e.g. John Doe" />
      </Form.Item>

      <Form.Item
        label="Email Address"
        name="email"
        rules={[
          { required: true, message: 'Please enter the email address!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input placeholder="john.doe@company.com" />
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item label="Role" name="role" rules={[{ required: true }]}>
          <Select>
            {Object.values(ROLES).map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Department" name="department" rules={[{ required: true }]}>
          <Select>
            {DEPARTMENTS.map((dept) => (
              <Select.Option key={dept} value={dept}>
                {dept}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <Form.Item label="Account Status" name="status">
        <Radio.Group>
          <Radio value="Active">Active</Radio>
          <Radio value="Inactive">Inactive</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create User
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default UserForm;
