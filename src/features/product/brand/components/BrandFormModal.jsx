import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Typography, Divider, Space } from 'antd';
import { TagOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

export function BrandFormModal({
  open = false,
  brand = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();
  const isEditMode = Boolean(brand && brand.brand_id);

  useEffect(() => {
    if (open) {
      if (brand) {
        form.setFieldsValue({
          brand_name: brand.brand_name || '',
          description: brand.description || '',
          active: brand.active === 1 || brand.active === true,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          brand_name: '',
          description: '',
          active: true,
        });
      }
    }
  }, [open, brand, form]);

  const handleFinish = async (values) => {
    await onSubmit({
      brand_name: values.brand_name,
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
            <TagOutlined style={{ color: '#1677ff' }} />
          )}
          <span style={{ fontWeight: 600 }}>
            {isEditMode ? `Edit Brand: ${brand.brand_name}` : 'Create New Brand'}
          </span>
        </Space>
      }
      okText={isEditMode ? 'Save Changes' : 'Create Brand'}
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
          name="brand_name"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Brand Name <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
          }
          rules={[
            { required: true, message: 'Please enter brand name' },
            { min: 2, message: 'Brand name must be at least 2 characters' },
            {
              validator: (_, value) => {
                if (value && !value.trim()) {
                  return Promise.reject(new Error('Brand name cannot be only whitespace'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="e.g. Starbucks, Apple, Samsung, Logitech..."
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
            placeholder="Brief description about the manufacturer or brand..."
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
          extra="Inactive brands will not appear in the product creation and POS filter menus."
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

export default BrandFormModal;
