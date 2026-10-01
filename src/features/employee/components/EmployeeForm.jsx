import React from 'react';
import { Form, Input, InputNumber, Select, Button, Space } from 'antd';
import { DEPARTMENTS } from '@/utils/constants';

export function EmployeeForm({ onSubmit, onCancel, isLoading }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        department: 'Engineering',
        salary: 100000,
        status: 'Full-time',
      }}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Employee Name"
        name="name"
        rules={[{ required: true, message: 'Please enter employee name!' }]}
      >
        <Input placeholder="e.g. Liam Vance" />
      </Form.Item>

      <Form.Item
        label="Email Address"
        name="email"
        rules={[
          { required: true, message: 'Please enter email address!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input placeholder="liam.vance@company.com" />
      </Form.Item>

      <Form.Item
        label="Job Position / Title"
        name="position"
        rules={[{ required: true, message: 'Please enter position!' }]}
      >
        <Input placeholder="e.g. Senior Backend Engineer" />
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item label="Department" name="department" rules={[{ required: true }]}>
          <Select>
            {DEPARTMENTS.map((dept) => (
              <Select.Option key={dept} value={dept}>
                {dept}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Annual Salary ($)"
          name="salary"
          rules={[{ required: true, message: 'Please enter salary!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </div>

      <Form.Item label="Employment Status" name="status">
        <Select>
          <Select.Option value="Full-time">Full-time</Select.Option>
          <Select.Option value="Part-time">Part-time</Select.Option>
          <Select.Option value="Contract">Contract</Select.Option>
          <Select.Option value="Intern">Intern</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Employee
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EmployeeForm;
