import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Typography, Divider, Space, Tag } from 'antd';
import { SlidersOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';

const { Text } = Typography;

const COMMON_ATTRIBUTE_NAMES = [
  'Size',
  'Sugar Level',
  'Ice Level',
  'Color',
  'Storage',
  'RAM Size',
  'Flavor',
  'Topping',
];

export function AttributeFormModal({
  open = false,
  attribute = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();
  const isEditMode = Boolean(attribute && attribute.attribute_id);

  useEffect(() => {
    if (open) {
      if (attribute) {
        form.setFieldsValue({
          attribute_name: attribute.attribute_name || '',
          attribute_value: attribute.attribute_value || '',
          active: attribute.active === 1 || attribute.active === true,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          attribute_name: '',
          attribute_value: '',
          active: true,
        });
      }
    }
  }, [open, attribute, form]);

  const handleFinish = async (values) => {
    await onSubmit({
      attribute_name: values.attribute_name,
      attribute_value: values.attribute_value,
      active: values.active ? 1 : 0,
    });
  };

  const handleSuggestionClick = (name) => {
    form.setFieldsValue({ attribute_name: name });
  };

  return (
    <Modal
      open={open}
      title={
        <Space size="small" style={{ fontSize: '16px' }}>
          {isEditMode ? (
            <EditOutlined style={{ color: '#1677ff' }} />
          ) : (
            <SlidersOutlined style={{ color: '#1677ff' }} />
          )}
          <span style={{ fontWeight: 600 }}>
            {isEditMode
              ? `Edit Attribute: ${attribute.attribute_name} (${attribute.attribute_value})`
              : 'Create New Attribute'}
          </span>
        </Space>
      }
      okText={isEditMode ? 'Save Changes' : 'Create Attribute'}
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
          name="attribute_name"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Attribute Name <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
          }
          rules={[
            { required: true, message: 'Please enter attribute name' },
            { min: 2, message: 'Attribute name must be at least 2 characters' },
            {
              validator: (_, value) => {
                if (value && !value.trim()) {
                  return Promise.reject(new Error('Attribute name cannot be only whitespace'));
                }
                return Promise.resolve();
              },
            },
          ]}
          style={{ marginBottom: 12 }}
        >
          <Input
            size="large"
            maxLength={100}
            showCount
          />
        </Form.Item>

        {/* Quick Suggestion Tags */}
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 6 }}>
            Quick suggestions:
          </Text>
          <Space wrap size={[6, 6]}>
            {COMMON_ATTRIBUTE_NAMES.map((name) => (
              <Tag
                key={name}
                style={{ cursor: 'pointer', borderRadius: 4, userSelect: 'none' }}
                onClick={() => handleSuggestionClick(name)}
              >
                + {name}
              </Tag>
            ))}
          </Space>
        </div>

        <Form.Item
          name="attribute_value"
          label={
            <Space size={4}>
              <TagsOutlined style={{ color: '#8c8c8c' }} />
              <Text strong style={{ fontSize: '13px' }}>
                Attribute Value <span style={{ color: '#ff4d4f' }}>*</span>
              </Text>
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter attribute value' },
            {
              validator: (_, value) => {
                if (value && !value.trim()) {
                  return Promise.reject(new Error('Attribute value cannot be only whitespace'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            size="large"
            maxLength={100}
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
          extra="Inactive attributes will not appear as selectable options in product forms and POS checkout."
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

export default AttributeFormModal;
