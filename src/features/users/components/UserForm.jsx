import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, Radio, InputNumber, Upload, Avatar, Typography, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  ShopOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { getAssetUrl } from '@/utils/imageUtils';

const { Text } = Typography;

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Cashier', value: 'cashier' },
  { label: 'Staff', value: 'staff' },
];

export function UserForm({ user, onSubmit, onCancel, loading }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const isEditing = Boolean(user && user.user_id);

  useEffect(() => {
    setFileList([]);
    setImageRemoved(false);

    if (user && user.user_id) {
      form.setFieldsValue({
        username: user.username || '',
        email: user.email || '',
        password: '', // Blank by default on edit
        full_name: user.full_name || '',
        role: user.role || 'staff',
        store_id: user.store_id || null,
        active: user.active !== undefined ? (user.active ? 1 : 0) : 1,
      });

      if (user.image) {
        const fullImagePath = user.image.startsWith('user_profile/')
          ? user.image
          : `user_profile/${user.image}`;
        setPreviewUrl(getAssetUrl(fullImagePath));
      } else {
        setPreviewUrl(null);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        role: 'staff',
        active: 1,
      });
      setPreviewUrl(null);
    }
  }, [user, form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files (JPG, PNG, WEBP, GIF, SVG)!');
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Profile image must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }

    setFileList([file]);
    setPreviewUrl(URL.createObjectURL(file));
    setImageRemoved(false);
    return false; // Prevent automatic upload
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setPreviewUrl(null);
    setImageRemoved(true);
  };

  const handleFinish = (values) => {
    const payload = { ...values };

    if (fileList.length > 0) {
      payload.imageFile = fileList[0];
    } else if (imageRemoved) {
      payload.image = null;
    } else if (user && user.image) {
      payload.image = user.image;
    }

    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        role: 'staff',
        active: 1,
      }}
      onFinish={handleFinish}
    >
      {/* Profile Picture Upload Section */}
      <Form.Item
        label={
          <Space size={4}>
            <PictureOutlined style={{ color: '#8c8c8c' }} />
            <Text strong style={{ fontSize: '13px' }}>
              Profile Picture (Optional)
            </Text>
          </Space>
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            border: '1px dashed #d9d9d9',
            borderRadius: '10px',
            backgroundColor: '#fafafa',
          }}
        >
          {previewUrl ? (
            <Avatar
              size={64}
              src={previewUrl}
              style={{
                borderRadius: '50%',
                border: '2px solid #1677ff',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <Avatar
              size={64}
              icon={<UserOutlined style={{ fontSize: '26px', color: '#bfbfbf' }} />}
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <Space size="small">
              <Upload
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="small">
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </Upload>
              {previewUrl && (
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={handleRemoveImage}
                >
                  Remove
                </Button>
              )}
            </Space>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Files saved to <code>src/assets/user_profile</code>. Max size: 10MB.
              </Text>
            </div>
          </div>
        </div>
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Username */}
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: 'Please enter a username!' },
            { min: 3, message: 'Username must be at least 3 characters!' },
          ]}
        >
          <Input prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} placeholder="e.g. john_cashier" />
        </Form.Item>

        {/* Email Address */}
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please enter the email address!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: '#8c8c8c' }} />} placeholder="e.g. john@pos.com" />
        </Form.Item>
      </div>

      {/* Password */}
      <Form.Item
        label={isEditing ? 'New Password (Optional)' : 'Password'}
        name="password"
        rules={
          isEditing
            ? []
            : [
                { required: true, message: 'Please enter a password!' },
                { min: 4, message: 'Password must be at least 4 characters!' },
              ]
        }
        extra={isEditing ? 'Leave blank to keep existing password unchanged.' : undefined}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
          placeholder={isEditing ? 'Enter new password to update' : 'Enter password'}
        />
      </Form.Item>

      {/* Full Name */}
      <Form.Item label="Full Name" name="full_name">
        <Input prefix={<IdcardOutlined style={{ color: '#8c8c8c' }} />} placeholder="e.g. Johnathan Doe" />
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Role */}
        <Form.Item
          label="System Role"
          name="role"
          rules={[{ required: true, message: 'Please select a user role!' }]}
        >
          <Select placeholder="Select role" options={ROLE_OPTIONS} />
        </Form.Item>

        {/* Store ID */}
        <Form.Item label="Store ID" name="store_id">
          <InputNumber
            prefix={<ShopOutlined style={{ color: '#8c8c8c' }} />}
            placeholder="e.g. 1"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>
      </div>

      {/* Active Status */}
      <Form.Item label="Account Status" name="active">
        <Radio.Group>
          <Radio value={1}>Active</Radio>
          <Radio value={0}>Inactive</Radio>
        </Radio.Group>
      </Form.Item>

      {/* Actions */}
      <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default UserForm;
