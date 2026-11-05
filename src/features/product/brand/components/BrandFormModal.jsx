import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Typography,
  Divider,
  Space,
  Upload,
  Button,
  Avatar,
  message,
} from 'antd';
import {
  TagOutlined,
  EditOutlined,
  FileTextOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { getAssetUrl } from '@/utils/imageUtils';

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
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const isEditMode = Boolean(brand && brand.brand_id);

  useEffect(() => {
    if (open) {
      setFileList([]);
      setImageRemoved(false);
      if (brand) {
        form.setFieldsValue({
          brand_name: brand.brand_name || '',
          description: brand.description || '',
          active: brand.active === 1 || brand.active === true,
        });
        setPreviewUrl(brand.image ? getAssetUrl(brand.image) : null);
      } else {
        form.resetFields();
        form.setFieldsValue({
          brand_name: '',
          description: '',
          active: true,
        });
        setPreviewUrl(null);
      }
    }
  }, [open, brand, form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 10;
    if (!isLt5M) {
      message.error('Image must be smaller than 10MB!');
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

  const handleFinish = async (values) => {
    const payload = {
      brand_name: values.brand_name,
      description: values.description || null,
      active: values.active ? 1 : 0,
    };

    if (fileList.length > 0) {
      payload.imageFile = fileList[0];
    } else if (imageRemoved) {
      payload.image = null;
    } else if (brand && brand.image) {
      payload.image = brand.image;
    }

    await onSubmit(payload);
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
            size="large"
            maxLength={100}
            showCount
          />
        </Form.Item>

        {/* Brand Picture Upload */}
        <Form.Item
          label={
            <Space size={4}>
              <PictureOutlined style={{ color: '#8c8c8c' }} />
              <Text strong style={{ fontSize: '13px' }}>
                Brand Logo / Picture (Optional)
              </Text>
            </Space>
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px',
              border: '1px dashed #d9d9d9',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            {previewUrl ? (
              <div style={{ position: 'relative' }}>
                <Avatar
                  shape="square"
                  size={64}
                  src={previewUrl}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : (
              <Avatar
                shape="square"
                size={64}
                icon={<PictureOutlined style={{ fontSize: '24px', color: '#bfbfbf' }} />}
                style={{
                  borderRadius: '8px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                    {previewUrl ? 'Change Image' : 'Select Image'}
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
                  Supported formats: JPG, PNG, WEBP, SVG (Max: 10MB)
                </Text>
              </div>
            </div>
          </div>
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
