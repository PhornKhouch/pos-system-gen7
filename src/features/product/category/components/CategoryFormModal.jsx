import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Typography, Divider, Space } from 'antd';
import { AppstoreAddOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

export function CategoryFormModal({
  open = false,
  category = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();
  const isEditMode = Boolean(category && category.category_id);

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          category_name: category.category_name || '',
          description: category.description || '',
          active: category.active === 1 || category.active === true,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          category_name: '',
          description: '',
          active: true,
        });
      }
    }
  }, [open, category, form]);

  const handleFinish = async (values) => {
    await onSubmit({
      category_name: values.category_name,
      description: values.description || null,
      active: values.active ? 1 : 0,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space size="small" style={{ fontSize: '16px' }}>
          {isEditMode ? (
            <EditOutlined style={{ color: '#1677ff' }} />
          ) : (
            <AppstoreAddOutlined style={{ color: '#1677ff' }} />
          )}
          <span style={{ fontWeight: 600 }}>
            {isEditMode ? `Edit Category: ${category.category_name}` : 'Create New Category'}
          </span>
        </Space>
      }
      okText={isEditMode ? 'Save Changes' : 'Create Category'}
      cancelText="Cancel"
      confirmLoading={loading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
      width={520}
      centered
    >
      <Divider style={{ margin: '12px 0 20px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ active: true }}
        requiredMark="optional"
      >
        <Form.Item
          name="category_name"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Category Name <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
          }
          rules={[
            { required: true, message: 'Please enter category name' },
            { min: 2, message: 'Category name must be at least 2 characters' },
            {
              validator: (_, value) => {
                if (value && !value.trim()) {
                  return Promise.reject(new Error('Category name cannot be only whitespace'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="e.g. Hot Coffee, Laptops, Mobile Phones..."
            size="large"
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <Space size={4}>
              <FileTextOutlined style={{ color: '#8c8c8c' }} />
              <Text strong style={{ fontSize: '13px' }}>
                Description
              </Text>
            </Space>
          }
        >
          <TextArea
            rows={3}
            placeholder="Brief explanation of items categorized under this group..."
            maxLength={300}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="active"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Status
            </Text>
          }
          valuePropName="checked"
          extra="Inactive categories will be hidden from cashier POS terminals and ordering apps."
        >
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CategoryFormModal;
