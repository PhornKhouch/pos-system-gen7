import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Button,
  Upload,
  Avatar,
  message,
} from 'antd';
import {
  ShoppingOutlined,
  EditOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { categoryApi } from '../../category/services/categoryApi';
import { brandApi } from '../../brand/services/brandApi';
import { attributeApi } from '../../prdattribute/services/attributeApi';
import { getAssetUrl } from '@/utils/imageUtils';

const { Text } = Typography;
const { TextArea } = Input;

export function ProductFormModal({
  open = false,
  product = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const isEditMode = Boolean(product && product.product_id);

  // Fetch relations for select options
  useEffect(() => {
    if (open) {
      categoryApi
        .getCategories()
        .then((res) => {
          if (res && res.list) setCategories(res.list);
        })
        .catch(() => {});

      brandApi
        .getBrands()
        .then((res) => {
          if (res && res.list) setBrands(res.list);
        })
        .catch(() => {});

      attributeApi
        .getAttributes()
        .then((res) => {
          if (res && res.list) setAttributes(res.list);
        })
        .catch(() => {});
    }
  }, [open]);

  // Set form values on open/change
  useEffect(() => {
    if (open) {
      setFileList([]);
      setImageRemoved(false);
      if (product) {
        form.setFieldsValue({
          product_name: product.product_name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          category_id: product.category_id || undefined,
          brand_id: product.brand_id || undefined,
          attribute_id: product.attribute_id || undefined,
          price: product.price ? parseFloat(product.price) : 0,
          cost: product.cost ? parseFloat(product.cost) : 0,
          quantity_stock: product.quantity_stock !== undefined ? parseInt(product.quantity_stock) : 0,
          description: product.description || '',
          active: product.active === 1 || product.active === true,
        });
        setPreviewUrl(product.image ? getAssetUrl(product.image) : null);
      } else {
        form.resetFields();
        form.setFieldsValue({
          product_name: '',
          sku: '',
          barcode: '',
          price: 0,
          cost: 0,
          quantity_stock: 0,
          description: '',
          active: true,
        });
        setPreviewUrl(null);
      }
    }
  }, [open, product, form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
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
      ...values,
      active: values.active ? 1 : 0,
    };

    if (fileList.length > 0) {
      payload.imageFile = fileList[0];
    } else if (imageRemoved) {
      payload.image = null;
    } else if (product && product.image) {
      payload.image = product.image;
    }

    await onSubmit(payload);
  };

  // Quick SKU generator
  const handleAutoGenerateSku = () => {
    const name = form.getFieldValue('product_name') || 'PRD';
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    form.setFieldsValue({ sku: `${prefix}-${randomSuffix}` });
  };

  return (
    <Modal
      open={open}
      title={
        <Space size="small" style={{ fontSize: '16px' }}>
          {isEditMode ? (
            <EditOutlined style={{ color: '#1677ff' }} />
          ) : (
            <ShoppingOutlined style={{ color: '#1677ff' }} />
          )}
          <span style={{ fontWeight: 600 }}>
            {isEditMode ? `Edit Product: ${product.product_name}` : 'Create New Product'}
          </span>
        </Space>
      }
      okText={isEditMode ? 'Save Changes' : 'Create Product'}
      cancelText="Cancel"
      confirmLoading={loading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
      width={680}
      centered
    >
      <Divider style={{ margin: '12px 0 20px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ active: true, price: 0, cost: 0, quantity_stock: 0 }}
        requiredMark="optional"
      >
        {/* Product Picture Upload */}
        <Form.Item
          label={
            <Space size={4}>
              <PictureOutlined style={{ color: '#8c8c8c' }} />
              <Text strong style={{ fontSize: '13px' }}>
                Product Image (Optional)
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
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            {previewUrl ? (
              <Avatar
                shape="square"
                size={64}
                src={previewUrl}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
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

        {/* Product Name & SKU */}
        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item
              name="product_name"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Product Name <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
              }
              rules={[
                { required: true, message: 'Please enter product name' },
                { min: 2, message: 'Product name must be at least 2 characters' },
                {
                  validator: (_, value) => {
                    if (value && !value.trim()) {
                      return Promise.reject(new Error('Product name cannot be only whitespace'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input maxLength={100} showCount />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="sku"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Text strong style={{ fontSize: '13px' }}>
                    SKU <span style={{ color: '#ff4d4f' }}>*</span>
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={handleAutoGenerateSku}
                    style={{ padding: 0, fontSize: '11px', height: 'auto' }}
                  >
                    Generate
                  </Button>
                </div>
              }
              rules={[
                { required: true, message: 'Please enter SKU' },
                {
                  validator: (_, value) => {
                    if (value && !value.trim()) {
                      return Promise.reject(new Error('SKU cannot be only whitespace'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
          </Col>
        </Row>

        {/* Category & Brand */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="category_id"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Category <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
              }
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={categories.map((c) => ({
                  value: c.category_id,
                  label: c.category_name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="brand_id"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Brand <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
              }
              rules={[{ required: true, message: 'Please select brand' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={brands.map((b) => ({
                  value: b.brand_id,
                  label: b.brand_name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Attribute & Barcode */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="attribute_id"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Attribute / Variant (Optional)
                </Text>
              }
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={attributes.map((a) => ({
                  value: a.attribute_id,
                  label: `${a.attribute_name}: ${a.attribute_value}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="barcode"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Barcode (Optional)
                </Text>
              }
            >
              <Input maxLength={50} />
            </Form.Item>
          </Col>
        </Row>

        {/* Pricing & Stock */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="price"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Selling Price ($) <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
              }
              rules={[{ required: true, message: 'Please enter selling price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                step={0.5}
                prefix="$"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="cost"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Cost Price ($)
                </Text>
              }
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                step={0.5}
                prefix="$"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="quantity_stock"
              label={
                <Text strong style={{ fontSize: '13px' }}>
                  Initial Stock
                </Text>
              }
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Description */}
        <Form.Item
          name="description"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Description
            </Text>
          }
        >
          <TextArea
            rows={2}
            maxLength={300}
            showCount
          />
        </Form.Item>

        {/* Active Status */}
        <Form.Item
          name="active"
          label={
            <Text strong style={{ fontSize: '13px' }}>
              Status
            </Text>
          }
          valuePropName="checked"
          extra="Inactive products will be hidden from cashier POS checkout and catalog listings."
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

export default ProductFormModal;
